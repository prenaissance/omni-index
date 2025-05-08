# Omni-Index Node Backend

This is the backend for Omni-Index. It provides a RESTful API for frontend clients to implement and synchronizes with other nodes in the network, using a Gossip Protocol and using atproto for social media aspects.

## Environment Variables

The following environment variables can be configured for the application:

| Variable                               | Description                                           | Required           | Default                 |
| -------------------------------------- | ----------------------------------------------------- | ------------------ | ----------------------- |
| `PORT`                                 | The port the server should listen on                  | :x:                | `8080`                  |
| `MONGODB_URL`                          | The URL to the MongoDB database                       | :white_check_mark: | N/A                     |
| `MONGODB_DB`                           | The name of the MongoDB database                      | :white_check_mark: | N/A                     |
| `FRONTEND_URL`                         | The URL of the frontend client                        | :white_check_mark: | N/A                     |
| `CALLBACK_URL`                         | The URL of the callback endpoint for authentication   | :white_check_mark: | N/A                     |
| `DANGEROUS_SKIP_IDENTITY_VERIFICATION` | Whether to skip SSL pinning for identity verification | :x:                | `false`                 |
| `INIT_ADMIN_IDENTITY`                  | The did or handle of the admin user                   | :white_check_mark: | N/A                     |
| `INIT_SESSION_SECRET`                  | The private key for the session cookie                | :x:                | Generated on first boot |
| `INIT_IMPORT_SOURCE`                   | The file or the URL of the peer node export endpoint  | :x:                | Does not import data    |

## Local Development

1. Run the necessary services with Docker Compose:

```bash
docker-compose up
```

2. Run the backend server in development mode:

```bash
pnpm --filter=backend dev
```

## TODOS

- [x] Implement authentication
- [x] Implement media entry creation
- [x] Add atproto integration
- [x] Add entry comments with atproto integration
- [x] Add data seeding
- [x] Implement admin initialization
- [x] Implement json data export
- [x] Implement json data import
- [x] Implement peer node data import
- [x] Implement the Gossip Protocol
- [x] Implement Gossip Protocol message deduplication
- [x] Implement Gossip Protocol conflict resolution
- [x] Implement firehose subscriptions
- [x] Implement user registration data migration
- [x] Implement comment likes and garbage collection
- [x] Add appropriate indices to the database using migrations
