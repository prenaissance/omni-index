<p align="center">
   <img src=./.github/images/repo-logo.svg width="200" height="200" />
</p>
<h1 align="center">Omni-Index - Decentralized Media Indexing</h1>

Omni-Index is a decentralized media indexing system that allows hosting a variety of web apps that can be used to reference and media files and replicate them between node peers. It is designed to be simple and cheap to host, and very resilient to takedowns.

## Features

- **Flexible Data Structure**: Omni-Index is designed to be have a flexible data structure that can be used to index a variety of media types and metadata at different levels of granularity. This allows for easy integration with existing media libraries, as well as support for community created BFFs/Frontends for Omni-Index.
- **Decentralized**: Omni-Index allows synchronizing data between nodes, allowing data sharing and strong resilience to node failures.
- **Customizable**: Omni-Index is designed to be customizable, allowing developers to create their own BFFs/Frontends for Omni-Index. You can easily create an interface for a desired media type, and use Omni-Index to store and synchronize the data.

## Self-Hosting

Omni-Index is designed to be easy and cheap to self-host. Below are the resource utilization figures for the application running on a Raspberry Pi 5 with 4GB of RAM:

```bash
CONTAINER ID   NAME                    CPU %     MEM USAGE / LIMIT    MEM %     NET I/O           BLOCK I/O        PIDS
65dce33fabab   omni-book-api-1         13.41%    81.89MiB / 256MiB    31.99%    72.5MB / 495kB    17.7MB / 0B      11
a8ecdd9c7632   omni-book-omni-book-1   0.00%     24.34MiB / 192MiB    12.68%    3.09MB / 126B     2.22MB / 0B      11
c5998c79e95a   omni-book-webserver-1   0.00%     5.531MiB / 128MiB    4.32%     52.5MB / 96.4MB   5.1GB / 172kB    2
e393a3a46bda   omni-book-mongo-1       0.42%     215.4MiB / 3.95GiB   5.33%     6.23MB / 3.77MB   111MB / 52.1MB   47
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
   MONGODB_URL=mongodb+srv://<username>:<password>@<cluster-url>/omni-index?retryWrites=true&w=majority
   ```
   Replace `<username>`, `<password>`, `<cluster-url>`, and `<database>` with your MongoDB credentials and cluster information.
5. Create a file in the path `./nginx/conf/default.conf` and add the content from [./deployment/nginx/conf/temp.conf](./deployment/nginx/conf/temp.conf), replacing `<domain>` with your domain name. Suggested command:

   ```bash
   mkdir -p ./nginx/conf
   curl https://raw.githubusercontent.com/prenaissance/omni-index/refs/heads/master/deployment/nginx/conf/temp.conf \
     | sed 's/<domain>/<your-domain>/g' > ./nginx/conf/default.conf
   ```

   This is needed for confirming ownership of the domain for TLS certificate generation. Make sure that the domain is already pointing to your server's IP address.

6. Create a `docker-compose.yml` file in the `omni-book` directory and add the content from [./deployment/docker-compose.cloud-mongo.yml](./deployment/docker-compose.cloud-mongo.yml), replacing `<your-domain>` with your domain name. Suggested command:

   ```bash
   curl https://raw.githubusercontent.com/prenaissance/omni-index/refs/heads/master/deployment/docker-compose.cloud-mongo.yml \
     | sed 's/<domain>/<your-domain>/g' > ./docker-compose.yml
   ```

   Replace `<domain>` with your domain name and configure any environment variables you want to change.

7. (Optional) If you'd like to use a data import to bootstrap your instance, add an extra array item in the `services.api.environment` section of the `docker-compose.yml` file:

   ```yaml
   - INIT_IMPORT_SOURCE=./omni_book_export.json
   ```

   You can specify an URL or a file. If you're using a file, make sure the `api` service has access to it by mounting it in the `volumes` section of the `docker-compose.yml` file:

   ```yaml
   volumes:
     - ./omni_book_export.json:/app/omni_book_export.json
   ```

   Suggested command:

   ```bash
   yq -i '.services.api.environment += ["INIT_IMPORT_SOURCE=https://api.book.omni-index.com/api/entries/exports/export"]' docker-compose.yml
   ```

8. Start the Docker containers:

   ```bash
   docker compose up -d
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

10. Edit the `./nginx/conf/default.conf` to match the content of [./deployment/nginx/conf/default.conf](./deployment/nginx/conf/default.conf). Make sure to replace `<domain>` with your domain name. Suggested command:

    ```bash
    curl https://raw.githubusercontent.com/prenaissance/omni-index/refs/heads/master/deployment/nginx/conf/default.conf \
      | sed 's/<domain>/<your-domain>/g' > ./nginx/conf/default.conf
    ```

11. Restart the webserver container:

    ```bash
    docker compose restart webserver
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

    Then, set up a cron job to run the script periodically. Edit your crontab with `crontab -e` and add the following line (get the absolute path via `realpath ./renew-certificates.sh`):

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
3. Create a file in the path `./nginx/conf/default.conf` and add the content from [./deployment/nginx/conf/temp.conf](./deployment/nginx/conf/temp.conf), replacing `<domain>` with your domain name. Suggested command:

   ```bash
   mkdir -p ./nginx/conf
   curl https://raw.githubusercontent.com/prenaissance/omni-index/refs/heads/master/deployment/nginx/conf/temp.conf \
     | sed 's/<domain>/<your-domain>/g' > ./nginx/conf/default.conf
   ```

   This is needed for confirming ownership of the domain for TLS certificate generation. Make sure that the domain is already pointing to your server's IP address.

4. Create a `docker-compose.yml` file in the `omni-book` directory and add the content from [./deployment/docker-compose.with-mongo.yml](./deployment/docker-compose.with-mongo.yml), replacing `<your-domain>` with your domain name. Suggested command:

   ```bash
   curl https://raw.githubusercontent.com/prenaissance/omni-index/refs/heads/master/deployment/docker-compose.with-mongo.yml \
     | sed 's/<domain>/<your-domain>/g' > ./docker-compose.yml
   ```

   Replace `<domain>` with your domain name and configure any environment variables you want to change.

5. (Optional) If you'd like to use a data import to bootstrap your instance, add an extra array item in the `services.api.environment` section of the `docker-compose.yml` file:

   ```yaml
   - INIT_IMPORT_SOURCE=./omni_book_export.json
   ```

   You can specify an URL or a file. If you're using a file, make sure the `api` service has access to it by mounting it in the `volumes` section of the `docker-compose.yml` file:

   ```yaml
   volumes:
     - ./omni_book_export.json:/app/omni_book_export.json
   ```

   Suggested command:

   ```bash
   yq -i '.services.api.environment += ["INIT_IMPORT_SOURCE=https://api.book.omni-index.com/api/entries/exports/export"]' docker-compose.yml
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

8. Edit the `./nginx/conf/default.conf` to match the content of [./deployment/nginx/conf/default.conf](./deployment/nginx/conf/default.conf). Make sure to replace `<domain>` with your domain name. Suggested command:

   ```bash
   curl https://raw.githubusercontent.com/prenaissance/omni-index/refs/heads/master/deployment/nginx/conf/default.conf \
     | sed 's/<domain>/<your-domain>/g' > ./nginx/conf/default.conf
   ```

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

    Then, set up a cron job to run the script periodically. Edit your crontab with `crontab -e` and add the following line (get the absolute path via `realpath ./renew-certificates.sh`):

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
