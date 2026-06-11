# Containerization Strategy: Sovereign Node 9010

To ensure the project remains "lossless" and maintains all requirements during transport and testing, we have containerized the application using Docker. This allows you to run the entire stack (Express backend + Vite frontend) in an isolated, reproducible environment.

## 1. Dockerfile Configuration
The `Dockerfile` uses a `node:20-slim` base to minimize footprint while including `python3` for the system integrity checks required by the methodology.

## 2. Building the Image
Run the following command in your terminal to build the Sovereign Node image:
```bash
docker build -t sovereign-node-9010 .
```

## 3. Running the Container
To start the node locally for testing before Azure deployment:
```bash
docker run -p 3000:3000 --name sovereign-instance sovereign-node-9010
```

## 4. Testing via CLI
Once the container is running, you can interact with the API or use the internal CLI tools to run data through the system. The Merkle Chain and Affidavit registries will persist within the container's lifecycle.

## 5. Lossless Transport
By using this container, you ensure that the "sections" of the project (Strategy, Methodology, Technical, Validation) are preserved exactly as they are in this environment, with no compression loss or property drift.
