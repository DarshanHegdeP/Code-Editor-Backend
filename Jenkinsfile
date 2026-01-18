pipeline {
    agent any

    stages {

        stage('Checkout Source') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DarshanHegdeP/Code-Editor-Backend.git'
            }
        }

        stage('Switch to Minikube Docker') {
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
