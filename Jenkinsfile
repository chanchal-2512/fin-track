pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'chanchal2512'
        IMAGE_NAME      = 'finance-tracker'
        IMAGE_TAG       = "${BUILD_NUMBER}"
    }

    stages {

        stage('1. Fetch Source Code') {
            steps {
                checkout scm
            }
        }

        stage('2. Code Quality Analysis') {
            steps {
                echo 'Running Code Quality Analysis via SonarQube (SonarCloud)...'
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_KEY')]) {
                    bat """
                        docker run --rm -v "%cd%:/usr/src" sonarsource/sonar-scanner-cli ^
                        -Dsonar.projectKey=chanchal-2512_finance-tracker ^
                        -Dsonar.organization=chanchal-2512 ^
                        -Dsonar.sources=. ^
                        -Dsonar.exclusions=**/node_modules/**,**/build/**,**/.git/** ^
                        -Dsonar.host.url=https://sonarcloud.io ^
                        -Dsonar.token=%SONAR_KEY%
                    """
                }
            }
        }

        stage('3. Vulnerability Scanning') {
            steps {
                echo 'Scanning dependencies for vulnerabilities with Trivy...'
                bat """
                    docker run --rm -v "%cd%:/project" aquasec/trivy fs ^
                    --scanners vuln ^
                    --exit-code 0 ^
                    --format table ^
                    /project > trivy-report.txt 2>&1 || exit 0
                """
                archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
            }
        }

        stage('4. Build Docker Image') {
            steps {
                echo 'Building Docker Image...'
                script {
                    appImage = docker.build("${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}")
                    bat "docker tag ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('5. Push to Docker Hub') {
            steps {
                echo 'Pushing Image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    bat "echo %PASS%| docker login -u %USER% --password-stdin"
                    bat "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                    bat "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('6. Deploy to Render') {
            steps {
                echo 'Triggering Deployment on Render...'
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_HOOK', variable: 'RENDER_HOOK')]) {
                    bat "curl --ssl-no-revoke -X POST \"%RENDER_HOOK%\""
                }
            }
        }

    }

    post {
        always {
            echo 'Pipeline execution finished.'
            cleanWs()
        }
        success {
            echo 'All stages passed. Finance Tracker deployed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check stage logs above.'
        }
    }
}
