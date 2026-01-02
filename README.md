# Mini-Piston: Local Code Execution Engine (Kubernetes)

This project is a lightweight clone of the Piston API, built from scratch to run on a local Ubuntu laptop. It uses **Kubernetes (Minikube)** to orchestrate **Docker containers** that execute code in Python, JavaScript, Go, and C.

## Architecture
1.  **API Node:** A Node.js Express server running in a Pod.
2.  **Docker-in-Docker:** The API Pod mounts the host's Docker socket to spawn sibling containers.
3.  **Transient Workers:** Code runs in isolated Alpine containers that die immediately after execution.

---

## 1. Prerequisites (Automated Setup)

We use **Ansible** to install Docker, Minikube, and Kubectl automatically.

**Run the setup playbook:**
```bash
# Install Ansible if not present
sudo apt update && sudo apt install ansible -y

# Run the playbook (prompts for sudo password)
ansible-playbook ansible/setup.yml --ask-become-pass
```
 Installation & Deployment
Step 1: Start Infrastructure
Bash

minikube start --driver=docker
Step 2: Pre-load Compiler Images (Crucial)
Prevents API timeouts on first run.

```bash

minikube image load python:3.9-alpine
minikube image load node:18-alpine
minikube image load golang:1.19-alpine
minikube image load gcc:latest
```

# 1. Point terminal to Minikube's Docker daemon
eval $(minikube docker-env)

# 2. Build the image inside Minikube
cd ~/mini-piston/app
docker build -t mini-piston:latest .

# 3. Apply Kubernetes config
kubectl apply -f ~/mini-piston/k8s/deployment.yaml

# 4. Restart the Pod to update
kubectl rollout restart deployment/piston-api

echo "http://$(minikube ip):30000/execute"
