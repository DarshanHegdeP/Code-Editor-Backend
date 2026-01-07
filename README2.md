# 🧪 Mini-Piston

Mini-Piston is a lightweight local clone of the Piston API, built from scratch to execute untrusted code securely using Docker and Kubernetes on a local Ubuntu machine. It demonstrates how online code execution engines work internally by spawning short-lived, isolated Docker containers for each request.

---

## ✨ Features

- Execute code in Python, JavaScript, Go, and C
- Docker-based isolated execution per request
- Kubernetes orchestration using Minikube
- Short-lived runtime containers
- Sandboxed execution:
  - No network access
  - Memory-limited containers
- Automatic cleanup after execution
- Fully local setup (no cloud required)

---

## 🏗️ Architecture Overview
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────────────┐
│  NodePort Service   │
│    (Port 30000)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│     API Pod         │
│  (Node.js/Express)  │
│                     │
│  /var/run/          │
│  docker.sock        │
│  (mounted)          │
└──────┬──────────────┘
       │ docker run
       ▼
┌─────────────────────┐
│  Isolated Worker    │
│    Container        │
│                     │
│  • python:alpine    │
│  • node:alpine      │
│  • golang:alpine    │
│  • gcc:latest       │
│                     │
│  [Code Execution]   │
│  [Auto-Cleanup]     │
└─────────────────────┘
```

**How it works:**

- **API Pod** receives execution requests and controls the workflow
- **Docker socket** (`/var/run/docker.sock`) is mounted into the API Pod to spawn sibling containers
- Each execution runs in a **fresh, isolated container** with the appropriate language runtime
- Containers are automatically destroyed after execution completes

---

## 📁 Project Structure
```
mini-piston/
├── ansible/
│   └── setup.yml
├── k8s/
│   └── deployment.yaml
├── Dockerfile
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 📋 Prerequisites

- **Operating System**: Ubuntu 20.04 / 22.04
- **Minimum RAM**: 8 GB
- **Required Software**: Docker, Minikube, kubectl (installed via Ansible)

---

## 🚀 Setup & Deployment (From Scratch)

### 1. Clone the repository
```bash
git clone https://github.com/kumaraswamys28/ansible mini-piston
cd mini-piston
```

### 2. Run automated setup using Ansible
```bash
sudo apt update
sudo apt install ansible -y
ansible-playbook ansible/setup.yml --ask-become-pass
```

Apply Docker group changes:
```bash
newgrp docker
```


### 3. Start Minikube (Docker driver)
```bash
minikube delete
minikube start --driver=docker --memory=3000 --cpus=2
```

Verify Minikube is running:
```bash
kubectl get nodes
```

### 4. Switch terminal to Minikube Docker (CRITICAL)
```bash
eval $(minikube docker-env)
```

Verify you're using Minikube's Docker daemon:
```bash
docker info | grep Name
```

Expected output:
```
Name: minikube
```

### 5. Pull runtime images (inside Minikube Docker)
```bash
docker pull python:3.9-alpine
docker pull node:18-alpine
docker pull golang:1.19-alpine
docker pull gcc:latest
```

Verify images are pulled:
```bash
docker images
```

### 6. Build the Mini-Piston API image
```bash
docker build -t mini-piston:latest .
```

Verify the image is built:
```bash
docker images | grep mini-piston
```

### 7. Deploy to Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
```

Wait for the pod to be ready:
```bash
kubectl get pods -w
```

### 8. Check API logs
```bash
kubectl logs -l app=piston-api --tail=50
```

Expected output:
```
Mini-Piston listening on port 3000
```

---

## 📡 API Usage

### Endpoint
```
POST /execute
```

### URL
```
http://<MINIKUBE_IP>:30000/execute
```

Get Minikube IP:
```bash
minikube ip
```


### Supported Languages

| Language   | Runtime Image         | Version |
|------------|-----------------------|---------|
| Python     | `python:3.9-alpine`   | 3.9     |
| JavaScript | `node:18-alpine`      | 18.x    |
| Go         | `golang:1.19-alpine`  | 1.19    |
| C          | `gcc:latest`          | Latest  |


---

## 🧪 Examples

### Python
```bash
curl -X POST http://$(minikube ip):30000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(\"Hello Mini-Piston\")"
  }'
```

**Response:**
```json
{
  "language": "python",
  "run": {
    "stdout": "Hello Mini-Piston\n",
    "stderr": "",
    "output": "Hello Mini-Piston\n",
    "code": 0,
    "signal": null
  }
}
```

### JavaScript
```bash
curl -X POST http://$(minikube ip):30000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "console.log(\"Hello from Node.js\")"
  }'
```

### Go
```bash
curl -X POST http://$(minikube ip):30000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "go",
    "code": "package main\nimport \"fmt\"\nfunc main() { fmt.Println(\"Hello from Go\") }"
  }'
```

### C
```bash
curl -X POST http://$(minikube ip):30000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "c",
    "code": "#include <stdio.h>\nint main() { printf(\"Hello from C\\n\"); return 0; }"
  }'
```

---

## 🐛 Troubleshooting

### Check pod status
```bash
kubectl get pods
kubectl describe pod <pod-name>
```

### View API logs
```bash
kubectl logs -l app=piston-api --tail=100 -f
```

### Verify Docker socket mount
```bash
kubectl exec -it <pod-name> -- ls -la /var/run/docker.sock
```

### Test Docker access inside pod
```bash
kubectl exec -it <pod-name> -- docker ps
```

### Restart deployment
```bash
kubectl rollout restart deployment piston-api
```

### Delete and redeploy
```bash
kubectl delete -f k8s/deployment.yaml
kubectl apply -f k8s/deployment.yaml
```

### Minikube not starting
```bash
minikube delete
minikube start --driver=docker --memory=3000 --cpus=2
```

### Images not found in Minikube

Ensure you've run:
```bash
eval $(minikube docker-env)
```

Then rebuild/pull images.

---

## 🧹 Cleanup

### Delete Kubernetes resources
```bash
kubectl delete -f k8s/deployment.yaml
```

### Stop Minikube
```bash
minikube stop
```

### Delete Minikube cluster
```bash
minikube delete
```

---
