# Omni-Index - Decentralized Media Indexing

Omni-Index is a decentralized media indexing system that allows hosting a variety of web apps that can be used to reference and media files and replicate them between node peers. It is designed to be simple and cheap to host, and very resilient to takedowns.

## Features

- **Flexible Data Structure**: Omni-Index is designed to be have a flexible data structure that can be used to index a variety of media types and metadata at different levels of granularity. This allows for easy integration with existing media libraries, as well as support for community created BFFs/Frontends for Omni-Index.
- **Decentralized**: Omni-Index allows synchronizing data between nodes, allowing data sharing and strong resilience to node failures.
- **Customizable**: Omni-Index is designed to be customizable, allowing developers to create their own BFFs/Frontends for Omni-Index. You can easily create an interface for a desired media type, and use Omni-Index to store and synchronize the data.

## Self-Hosting

Omni-Index is designed to be easy and cheap to self-host. Below are the resource utilization figures for the application running on a Raspberry Pi 5 with 4GB of RAM:

```bash
CONTAINER ID   NAME                    CPU %     MEM USAGE / LIMIT    MEM %     NET I/O           BLOCK I/O         PIDS
2cde3e3f4d29   omni-book-omni-book-1   0.00%     91.17MiB / 3.95GiB   2.25%     4.89MB / 2.4MB    938kB / 23.2MB    22
d772a1c186a5   omni-book-api-1         9.54%     332.7MiB / 3.95GiB   8.22%     37.2GB / 207MB    246kB / 0B        11
fac23113787c   omni-book-webserver-1   0.00%     17.38MiB / 3.95GiB   0.43%     3MB / 2.68MB      12.2MB / 4.1kB    5
e393a3a46bda   omni-book-mongo-1       0.42%     215.4MiB / 3.95GiB   5.33%     6.23MB / 3.77MB   111MB / 52.1MB    47
```

The following section document ways to self-host Omni-Book, one of the official interfaces for Omni-Index, along with all the necessary dependencies:

### VPS with Docker

#### Pre-requisites

- A VPS or dedicated server with Docker installed.
- SSH access to the server.
- A domain name pointing to the server's IP address (optional, but highly recommended).

#### Cloud Hosted MongoDB

1. SSH into your server.
2. Create a new directory for your installation:
   ```bash
   mkdir omni-book
   cd omni-book
   ```
3. Provision a free MongoDB cluster using [MongoDB Atlas](https://cloud.mongodb.com/)
4. Create a `.env` file in the `omni-book` directory and add the following environment variable:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/omni-index?retryWrites=true&w=majority
   ```
   Replace `<username>`, `<password>`, `<cluster-url>`, and `<database>` with your MongoDB credentials and cluster information.
5. Create a file in the path `./nginx/conf/default.conf` and add the following content:

   ```nginx
   server {
      listen 80;
      server_name <your-domain> api.<your-domain>;

      location /.well-known/acme-challenge/ {
         root /var/www/certbot;
      }

      # Redirect all other HTTP traffic to HTTPS
      location / {
         return 301 https://$host$request_uri;
      }
   }
   ```

   Replace `<your-domain>` with your domain name. This is needed for confirming ownership of the domain for TLS certificate generation. Make sure that the domain is already pointing to your server's IP address.

6. Create a `docker-compose.yml` file in the `omni-book` directory and add the following content:

   ```yaml
   services:
   webserver:
     image: nginx:latest
     ports:
       - 80:80
       - 443:443
     restart: unless-stopped
     volumes:
       - ./nginx/conf/:/etc/nginx/conf.d/:ro
       - ./certbot/www/:/var/www/certbot/:ro
       - ./certbot/conf/:/etc/letsencrypt/:ro
   certbot:
     image: certbot/certbot:latest
     volumes:
       - ./certbot/www/:/var/www/certbot/:rw
       - ./certbot/conf/:/etc/letsencrypt/:rw

   api:
     image: prenaissance/omni-index:0.0.1-alpha4
     restart: unless-stopped
     env_file:
       - .env
     environment:
       - PORT=80
       - MONGODB_DB=omni-index
       - FRONTEND_URL=https://<your-domain>
       - CALLBACK_URL=https://<your-domain>/api/oauth/callback
       - DANGEROUS_SKIP_IDENTITY_VERIFICATION=true
       - INIT_ADMIN_IDENTITY=prenaissance.bsky.social

   omni-book:
     image: prenaissance/omni-book:0.0.1-alpha4
     restart: unless-stopped
     environment:
       - PORT=80
       - API_URL=http://api:80
   ```

   Replace `<your-domain>` with your domain name.

7. (Optional) If you'd like to use a data import to bootstrap your instance, add an extra array item in the `services.api.environment` section of the `docker-compose.yml` file:

   ```yaml
   - INIT_IMPORT_SOURCE=./omni_book_export.json
   ```

   You can specify an URL or a file. If you're using a file, make sure the `api` service has access to it by mounting it in the `volumes` section of the `docker-compose.yml` file:

   ```yaml
   volumes:
     - ./omni_book_export.json:/app/omni_book_export.json
   ```

8. Start the Docker containers:

   ```bash
   docker-compose up -d
   ```

9. Generate a TLS certificate using certbot:

   ```bash
   docker compose run --rm certbot certonly \
      --webroot --webroot-path=/var/www/certbot \
      -d <your_domain> \
      -d api.<your_domain> \
      --agree-tos --email your-email@example.com --no-eff-email
   ```

   Replace `<your-domain>` with your domain name.

10. Edit the `./nginx/conf/default.conf` to match the content of [this configuration](./deployment/nginx/conf/default.conf). Make sure to use your domain for the `server_name` directives.

11. Restart the webserver container:

    ```bash
    docker-compose restart webserver
    ```

12. (Optional) Set up a cron job to periodically refresh your TLS certificate. Create a file `renew-certificates.sh` in your project root with the following content:

    ```bash
    #!/bin/bash
    docker compose run --rm certbot renew
    docker compose exec webserver nginx -s reload
    ```

    Make the script executable:

    ```bash
    chmod +x renew-certificates.sh
    ```

    Then, set up a cron job to run the script periodically. Edit your crontab with `crontab -e` and add the following line:

    ```bash
    30 3 * * * /bin/bash /path/to/your/project/renew-certificates.sh >> /var/log/letsencrypt-renew.log 2>&1
    ```

    This script won't do anything if the certificate is not close to expiry, so it's safe for it to execute every day.

#### Self Hosted MongoDB

1. SSH into your server.
2. Create a new directory for your installation:
   ```bash
   mkdir omni-book
   cd omni-book
   ```
3. Create a file in the path `./nginx/conf/default.conf` and add the following content:

   ```nginx
   server {
      listen 80;
      server_name <your-domain> api.<your-domain>;

      location /.well-known/acme-challenge/ {
         root /var/www/certbot;
      }

      # Redirect all other HTTP traffic to HTTPS
      location / {
         return 301 https://$host$request_uri;
      }
   }
   ```

   Replace `<your-domain>` with your domain name. This is needed for confirming ownership of the domain for TLS certificate generation. Make sure that the domain is already pointing to your server's IP address.

4. Create a `docker-compose.yml` file in the `omni-book` directory and add the following content:

   ```yaml
   volumes:
     mongo_data:

   services:
   mongo:
     image: mongo:8
     restart: unless-stopped
     volumes:
       - mongo_data:/data/db
   webserver:
     image: nginx:latest
     ports:
       - 80:80
       - 443:443
     restart: unless-stopped
     volumes:
       - ./nginx/conf/:/etc/nginx/conf.d/:ro
       - ./certbot/www/:/var/www/certbot/:ro
       - ./certbot/conf/:/etc/letsencrypt/:ro
   certbot:
     image: certbot/certbot:latest
     volumes:
       - ./certbot/www/:/var/www/certbot/:rw
       - ./certbot/conf/:/etc/letsencrypt/:rw

   api:
     image: prenaissance/omni-index:0.0.1-alpha4
     restart: unless-stopped
     environment:
       - PORT=80
       - MONGODB_URL=mongodb://mongo:27017
       - MONGODB_DB=omni-index
       - FRONTEND_URL=https://book.omni-index.com
       - CALLBACK_URL=https://book.omni-index.com/api/oauth/callback
       - DANGEROUS_SKIP_IDENTITY_VERIFICATION=true
       - INIT_ADMIN_IDENTITY=prenaissance.bsky.social

   omni-book:
     image: prenaissance/omni-book:0.0.1-alpha4
     restart: unless-stopped
     environment:
       - PORT=80
       - API_URL=http://api:80
   ```

   Replace `<your-domain>` with your domain name.

5. (Optional) If you'd like to use a data import to bootstrap your instance, add an extra array item in the `services.api.environment` section of the `docker-compose.yml` file:

   ```yaml
   - INIT_IMPORT_SOURCE=./omni_book_export.json
   ```

   You can specify an URL or a file. If you're using a file, make sure the `api` service has access to it by mounting it in the `volumes` section of the `docker-compose.yml` file:

   ```yaml
   volumes:
     - ./omni_book_export.json:/app/omni_book_export.json
   ```

6. Start the Docker containers:

   ```bash
   docker-compose up -d
   ```

7. Generate a TLS certificate using certbot:

   ```bash
   docker compose run --rm certbot certonly \
      --webroot --webroot-path=/var/www/certbot \
      -d <your_domain> \
      -d api.<your_domain> \
      --agree-tos --email your-email@example.com --no-eff-email
   ```

   Replace `<your-domain>` with your domain name.

8. Edit the `./nginx/conf/default.conf` to match the content of [this configuration](./deployment/nginx/conf/default.conf). Make sure to use your domain for the `server_name` directives.

9. Restart the webserver container:

   ```bash
   docker-compose restart webserver
   ```

10. (Optional) Set up a cron job to periodically refresh your TLS certificate. Create a file `renew-certificates.sh` in your project root with the following content:

    ```bash
    #!/bin/bash
    docker compose run --rm certbot renew
    docker compose exec webserver nginx -s reload
    ```

    Make the script executable:

    ```bash
    chmod +x renew-certificates.sh
    ```

    Then, set up a cron job to run the script periodically. Edit your crontab with `crontab -e` and add the following line:

    ```bash
    30 3 * * * /bin/bash /path/to/your/project/renew-certificates.sh >> /var/log/letsencrypt-renew.log 2>&1
    ```

    This script won't do anything if the certificate is not close to expiry, so it's safe for it to execute every day.

### Helm Chart

#### Pre-requisites

- A Kubernetes cluster (e.g., GKE, EKS, AKS, or a local cluster using something like K3S).
- Helm installed on your local machine.
- A domain name pointing to the cluster's ingress controller.

WIP
