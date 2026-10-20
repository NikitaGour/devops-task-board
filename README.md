# DevOps Task Board

A full-stack task management application used to demonstrate containerization, CI/CD, cloud deployment, Kubernetes orchestration, Infrastructure as Code, and application monitoring.

## Project Overview

The DevOps Task Board lets users create tasks through a web interface. The frontend communicates with a Node.js/Express backend, which stores task data in PostgreSQL.

The project explores deploying the same application using Docker Compose on AWS EC2 and Kubernetes with Helm in a local Minikube environment.

## Architecture

- **Frontend:** React and Vite, served by Nginx
- **Backend:** Node.js and Express
- **Database:** PostgreSQL
- **Containers:** Docker and Docker Compose
- **CI/CD:** GitHub Actions and GitLab CI
- **Container registry:** GitHub Container Registry (GHCR)
- **Orchestration:** Kubernetes, Minikube, and Helm
- **Infrastructure as Code:** Terraform
- **Monitoring:** Prometheus metrics and Grafana
- **Cloud deployment:** AWS EC2

## Key Features

- Create tasks and verify that data persists after page refresh.
- Run the frontend, backend, and PostgreSQL as separate containers.
- Check backend and database connectivity using a health endpoint.
- Expose Prometheus-formatted backend metrics at `/metrics`.
- Build and publish container images through GitHub Actions.
- Deploy the application to Kubernetes using Helm.
- Provision cloud infrastructure with Terraform.

## Local Docker Compose Deployment

Prerequisites: Docker Engine and Docker Compose.

Clone the repository:

```bash
git clone https://github.com/NikitaGour/devops-task-board.git
cd devops-task-board
```

Start the application:

```bash
docker compose up -d --build
```

Open the frontend at `http://localhost:8080` when using the repository's default Compose port mapping.

Check service status:

```bash
docker compose ps
```

Check backend health:

```bash
curl http://localhost:5001/health
```

Check Prometheus metrics:

```bash
curl http://localhost:5001/metrics
```

Stop the containers:

```bash
docker compose down
```

To remove the local database volume as well, use `docker compose down -v` only if you intentionally want to delete its stored data.

## CI/CD

The project uses GitHub Actions to automate application checks and container image builds and publishing. GitLab CI is also configured for backend tests with a GitLab Runner.

Container images are published to GitHub Container Registry:

- `ghcr.io/nikitagour/devops-task-backend`
- `ghcr.io/nikitagour/devops-task-frontend`

Review the workflow files under `.github/workflows/` for the exact jobs and triggers.

## Kubernetes and Helm

The application has also been deployed to a local Kubernetes cluster using Minikube and Helm. The project includes monitoring work with Prometheus and Grafana.

The local Kubernetes environment is separate from the AWS EC2 Docker Compose deployment.

## AWS and Terraform

Terraform was used to provision a dedicated EC2 instance and security group in AWS Mumbai (`ap-south-1`). Docker Compose was used to run the application on the instance.

The deployed backend was verified using the health endpoint and Prometheus metrics endpoint.

**Cost note:** AWS resources are billable while active. Review and destroy project-specific cloud resources when the deployment is no longer needed.

## Verification

The following checks were performed during the project:

- Backend health endpoint returned HTTP 200.
- PostgreSQL reported a healthy status.
- Tasks persisted after refreshing the application.
- The backend `/metrics` endpoint returned Prometheus-formatted metrics.
- Docker Compose services were running on EC2.

## Learning Outcomes

This project demonstrates practical experience with containerization, CI/CD, image publishing, Kubernetes deployments, Helm, infrastructure provisioning, cloud-hosted application deployment, and monitoring.

## Repository

[GitHub — DevOps Task Board](https://github.com/NikitaGour/devops-task-board)
