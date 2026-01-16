# Mini-Piston CI/CD Pipeline Documentation

## Overview

This guide provides complete instructions for setting up and running a CI/CD pipeline for Mini-Piston using GitHub Actions, Ansible, and Kubernetes (Minikube).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [CI/CD Setup](#cicd-setup)
3. [Configuration Files](#configuration-files)
4. [Running the Pipeline](#running-the-pipeline)
5. [Accessing the Deployed Backend](#accessing-the-deployed-backend)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Ubuntu machine (local or VM)
- Docker installed
- Minikube installed
- kubectl installed
- GitHub repository with Mini-Piston code

---

## CI/CD Setup

### 1. Configure Self-Hosted GitHub Actions Runner

**Step 1:** Navigate to your GitHub repository

**Step 2:** Go to `Settings → Actions → Runners → New self-hosted runner`

**Step 3:** Select `Linux (x64)`

**Step 4:** Run the provided commands on your local Ubuntu machine:
```bash
# Download the runner
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.XXX.X.tar.gz -L https://github.com/actions/runner/releases/download/vX.XXX.X/actions-runner-linux-x64-2.XXX.X.tar.gz

# Extract the runner
tar xzf ./actions-runner-linux-x64-2.XXX.X.tar.gz

# Configure the runner
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN
```

**Step 5:** Configure with the following settings:
- **Runner name:** `mini-piston-runner`
- **Label:** `minikube`

**Step 6:** Start the runner:
```bash
./run.sh
```

**Step 7:** Verify the runner status is **green/idle** in the GitHub UI

---

### 2. Create Workflow Directory Structure
```bash
mkdir -p .github/workflows
mkdir -p ansible
```

---

## Configuration Files

### 1. GitHub Actions Workflow File

Create `.github/workflows/full-cicd.yml`:
```yaml
name: Mini-Piston Full CI/CD

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: [self-hosted, minikube]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Install Ansible (if missing)
      run: |
        if ! command -v ansible >/dev/null; then
          sudo apt update && sudo apt install -y ansible
        fi

    - name: Validate environment using Ansible
      run: ansible-playbook -i localhost, ansible/validate.yml

    - name: Use Minikube Docker daemon
      run: |
        eval $(minikube docker-env)
        docker info | grep Name

    - name: Build Mini-Piston image
      run: |
        eval $(minikube docker-env)
        docker build -t mini-piston:latest .

    - name: Deploy to Kubernetes
      run: kubectl apply -f k8s/deployment.yaml

    - name: Restart API deployment
      run: |
        kubectl rollout restart deployment piston-api
        kubectl rollout status deployment piston-api
```

---

### 2. Ansible Validation Playbook

Create `ansible/validate.yml`:
```yaml
---
- hosts: localhost
  connection: local
  become: false
  tasks:
    - name: Validate Docker access
      command: docker ps
      changed_when: false

    - name: Validate kubectl connectivity
      command: kubectl get nodes
      changed_when: false

    - name: Ensure Minikube is running
      command: minikube start --driver=docker
      changed_when: false
```

---

### 3. Push Configuration to GitHub
```bash
git add .github/workflows/full-cicd.yml ansible/validate.yml
git commit -m "Add CI/CD pipeline with Ansible validation"
git push origin main
```

---

## Running the Pipeline

### Initial Pipeline Trigger

The pipeline automatically triggers on every push to the `main` branch.

**What happens during execution:**

1. GitHub Actions triggers on push to main
2. Runs on local self-hosted runner (`mini-piston-runner`)
3. Validates environment using Ansible
4. Builds Mini-Piston Docker image (`mini-piston:latest`)
5. Deploys to local Minikube Kubernetes cluster
6. Restarts the API pod

---

### Manual Pipeline Execution

**Step 1:** Ensure Minikube is running:
```bash
minikube start
```

**Step 2:** Start the GitHub Actions runner:
```bash
cd actions-runner
./run.sh
```

**Step 3:** Make a code change and push:
```bash
git add .
git commit -m "Trigger CI/CD"
git push origin main
```

**Step 4:** Monitor pipeline execution:
- Open GitHub → Actions
- Confirm pipeline execution on self-hosted runner

---

## Accessing the Deployed Backend

### Backend Access URL

Your backend is exposed via Kubernetes NodePort on port **30000**.

**Step 1:** Get Minikube IP:
```bash
minikube ip
```

**Example output:**
```
192.168.49.2
```

**Step 2:** Your backend endpoint is:
```
http://<MINIKUBE_IP>:30000/execute
```

**Example:**
```
http://192.168.49.2:30000/execute
```

---

### Test Deployment
```bash
# Get Minikube IP
minikube ip

# Test the endpoint
curl http://<MINIKUBE_IP>:30000/execute
```

---

### Frontend Integration

**👉 This is the URL the frontend must call**

Configure your frontend to make API requests to:
```
http://<MINIKUBE_IP>:30000/execute
```

Replace `<MINIKUBE_IP>` with the actual IP from `minikube ip` command.

---

## Troubleshooting

### Runner Not Starting
```bash
# Check runner status
cd actions-runner
./run.sh
```

### Minikube Issues
```bash
# Restart Minikube
minikube stop
minikube start

# Check cluster status
minikube status
kubectl get nodes
```

### Deployment Issues
```bash
# Check pod status
kubectl get pods

# Check logs
kubectl logs deployment/piston-api

# Check deployment status
kubectl get deployment piston-api
```

### Docker Build Issues
```bash
# Ensure using Minikube Docker daemon
eval $(minikube docker-env)

# Verify Docker access
docker ps
```

---

## CI/CD Pipeline Summary

### Deployment Target
- **Platform:** Local Kubernetes cluster (Minikube)
- **Runner:** Self-hosted GitHub Actions runner
- **Port:** NodePort 30000
- **Image:** mini-piston:latest

### Trigger
- Every push to `main` branch

### Workflow Steps
1. Checkout repository code
2. Validate environment (Ansible)
3. Build Docker image
4. Deploy to Kubernetes
5. Restart API deployment

---

✅ **End of CI/CD Documentation**
