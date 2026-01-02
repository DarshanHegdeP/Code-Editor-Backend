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
