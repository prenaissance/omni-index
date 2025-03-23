# Omni-Index Node Backend

This is the backend for Omni-Index. It provides a RESTful API for frontend clients to implement and synchronizes with other nodes in the network, using a Gossip Protocol and using atproto for social media aspects.

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
- [ ] Implement the Gossip Protocol
- [ ] Implement Gossip Protocol message deduplication
- [ ] Implement Gossip Protocol conflict resolution
- [ ] Implement firehose subscriptions
- [x] Implement user registration data migration
- [x] Implement comment likes and garbage collection
- [x] Add appropriate indices to the database using migrations
