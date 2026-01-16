# Jenkins CI/CD Automation for Mini-Piston Backend

## 📋 Overview

The Mini-Piston backend is a Node.js application that executes user code inside isolated Docker containers. This project uses Jenkins for automated CI/CD deployment to a local Kubernetes cluster running on Minikube.

---

## 🏗️ Project Structure

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
├── Jenkinsfile
└── README.md
```

---

## 📦 Installation Guide

### ***1. Install Java (Jenkins Dependency)***

```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
```

Verify installation:

```bash
java -version
```

---

### ***2. Install Jenkins***

Add Jenkins repository and install:

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y
```

Start and enable Jenkins:

```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

---

### ***3. Jenkins Initial Setup***

1. Open browser and navigate to `http://localhost:8080`
2. Get initial admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

3. Paste password in the UI
4. Select **Install suggested plugins**
5. Create admin user
6. Finish setup and access Jenkins dashboard

---

### ***4. Configure Jenkins for Docker***

Allow Jenkins user to access Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Verify Docker access:

```bash
sudo -u jenkins docker ps
```

---

## 🔧 Environment Setup

### ***5. Prepare System with Ansible***

Run the Ansible playbook to install Docker, Minikube, and kubectl:

```bash
ansible-playbook ansible/setup.yml --ask-become-pass
newgrp docker
```

---

### ***6. Configure Minikube for Jenkins***

Clean any existing Minikube installations:

```bash
sudo minikube delete --all --purge
sudo rm -rf /home/*/.minikube /home/*/.kube /var/lib/minikube
```

Start Minikube as Jenkins user:

```bash
sudo -u jenkins minikube start --driver=docker --memory=3000 --cpus=2
```

Verify Minikube status:

```bash
sudo -u jenkins minikube status
sudo -u jenkins kubectl get nodes
```

---

## 🔄 Jenkins Pipeline Configuration

### ***7. Jenkinsfile***

The pipeline automates the entire build and deployment process:

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DarshanHegdeP/Code-Editor-Backend.git'
            }
        }

        stage('Use Minikube Docker') {
            steps {
                sh '''
                  eval $(minikube docker-env)
                  docker info | grep Name
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                  eval $(minikube docker-env)
                  docker build -t mini-piston:latest .
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/deployment.yaml'
            }
        }

        stage('Restart Backend Pod') {
            steps {
                sh '''
                  kubectl rollout restart deployment piston-api
                  kubectl rollout status deployment piston-api
                '''
            }
        }
    }
}
```

---

### ***8. Commit Jenkinsfile to Repository***

```bash
git add Jenkinsfile
git commit -m "Add Jenkins CI/CD pipeline"
git push origin main
```

---

### ***9. Create Jenkins Pipeline Job***

1. Open Jenkins dashboard
2. Click **New Item**
3. Enter name: `mini-piston-backend-cicd`
4. Select **Pipeline**
5. Under **Pipeline** section:
   - Choose **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: Your GitHub repository URL
   - Branch: `main`
   - Script path: `Jenkinsfile`
6. Click **Save**

---

## ▶️ Running the CI/CD Pipeline

### ***10. Execute Pipeline***

1. Open the Jenkins job
2. Click **Build Now**
3. Monitor the pipeline stages:
   - ✅ Checkout source code
   - ✅ Build Docker image
   - ✅ Deploy to Kubernetes
   - ✅ Restart pod

A green build indicates successful CI/CD execution.

---

### ***11. Verify Deployment***

Get Minikube IP:

```bash
sudo -u jenkins minikube ip
```

Check running pods:

```bash
sudo -u jenkins kubectl get pods
```

Test the backend API:

```bash
curl http://<MINIKUBE_IP>:30000/execute
```

---

## 🔁 CI/CD Workflow

The automated pipeline follows these steps:

1. **Pull Code**: Jenkins fetches latest code from GitHub
2. **Build Image**: Docker image is rebuilt inside Minikube environment
3. **Deploy**: Kubernetes deployment manifest is applied
4. **Restart**: Backend pod is restarted with new image
5. **Live**: Updated backend becomes available automatically

---

## 🎯 Deployment Details

- **Platform**: Local Kubernetes cluster (Minikube)
- **Orchestrator**: Jenkins
- **Exposure**: NodePort service on port 30000
- **Container Runtime**: Docker

---

## 🔄 Daily Operations

To run CI/CD after system restart:

```bash
# Start Jenkins
sudo systemctl start jenkins

# Start Minikube
sudo -u jenkins minikube start

# Open Jenkins dashboard and click "Build Now"
```

---

## 📝 Notes

- Minikube runs under the Jenkins user to ensure proper permissions
- Docker images are built directly in Minikube's Docker daemon
- The pipeline uses `imagePullPolicy: Never` to use locally built images
- All deployments are local and do not require external registries


---

**Author**: Darshan Hegde P  
**Repository**: [Code-Editor-Backend](https://github.com/DarshanHegdeP/Code-Editor-Backend)
