# Omni-Index - Decentralized Media Indexing

Omni-Index is a decentralized media indexing system that allows hosting a variety of web apps that can be used to reference and media files and replicate them between node peers. It is designed to be simple and cheap to host, and very resilient to takedowns.

## Features

- **Flexible Data Structure**: Omni-Index is designed to be have a flexible data structure that can be used to index a variety of media types and metadata at different levels of granularity. This allows for easy integration with existing media libraries, as well as support for community created BFFs/Frontends for Omni-Index.
- **Decentralized**: Omni-Index allows synchronizing data between nodes, allowing data sharing and strong resilience to node failures.
- **Customizable**: Omni-Index is designed to be customizable, allowing developers to create their own BFFs/Frontends for Omni-Index. You can easily create an interface for a desired media type, and use Omni-Index to store and synchronize the data.

## Self-Hosting

Omni-Index is designed to be easy to self-host. Below are some officially documented ways to self-host Omni-Book, one of the official interfaces for Omni-Index, along with all the necessary dependencies:

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
5. Create a `docker-compose.yml` file in the `omni-book` directory and add the following content:

   ```yaml

   ```

6. Start the Docker container:
   ```bash
   docker-compose up -d
   ```
7. (Optional) Set up a cron job to periodically refresh your TLS certificate:

   ```bash

   ```

8. Add a DNS record for your domain name pointing to your server's IP address. If you are using a reverse proxy, make sure to configure it to forward requests to the Omni-Book container.

#### Self Hosted MongoDB

1. SSH into your server.
2. Create a new directory for your installation:
   ```bash
   mkdir omni-book
   cd omni-book
   ```
3. Create a `docker-compose.yml` file in the `omni-book` directory and add the following content:

   ```yaml

   ```

4. Start the Docker container:
   ```bash
   docker-compose up -d
   ```
5. (Optional) Set up a cron job to periodically refresh your TLS certificate:

   ```bash

   ```

6. Add a DNS record for your domain name pointing to your server's IP address. If you are using a reverse proxy, make sure to configure it to forward requests to the Omni-Book container.

### Helm Chart

#### Pre-requisites

- A Kubernetes cluster (e.g., GKE, EKS, AKS, or a local cluster using something like K3S).
- Helm installed on your local machine.
- A domain name pointing to the cluster's ingress controller.

WIP
