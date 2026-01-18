pipeline {
    agent any

    stages {

        stage('Checkout Source') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DarshanHegdeP/Code-Editor-Backend.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                  docker build -t mini-piston:latest .
                '''
            }
        }

        stage('Load Image into Minikube') {
            steps {
                sh '''
                  minikube image load mini-piston:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                  kubectl apply -f k8s/deployment.yaml
                '''
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
