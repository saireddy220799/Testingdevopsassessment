pipeline {

    agent any

    parameters {

        choice(
            name: 'DEPLOYMENT_ACTION',
            choices: ['DEPLOY', 'ROLLBACK'],
            description: 'Select deployment action'
        )

        choice(
            name: 'ENVIRONMENT',
            choices: ['UAT', 'PRODUCTION'],
            description: 'Select environment'
        )

        choice(
            name: 'VERSION',
            // defaultValue: '4.2.1',
            choices: ['4.2.1', '4.2.2'],
            description: 'Application version/tag'
        )

        choice(
            name: 'CONFIRM_PROD',
            choices: ['NO', 'YES'],
            description: 'Production deployment confirmation'
        )
    }

    environment {
        IMAGE_NAME = "retail-app"
        CONTAINER_NAME = "retail-app"
        NETWORK_NAME = "retail-network"
        PORT = "8081"
    }

    stages {
        stage('Pipeline Parameters') {
            steps {
                script {
                    echo "======================================"
                    echo "Deployment Action : ${params.DEPLOYMENT_ACTION}"
                    echo "Environment       : ${params.ENVIRONMENT}"
                    echo "Version            : ${params.VERSION}"
                    echo "Production Confirm : ${params.CONFIRM_PROD}"
                    echo "======================================"
                    if (
                        params.ENVIRONMENT == 'PRODUCTION' &&
                        params.CONFIRM_PROD != 'YES'
                    ) {
                        error("Production deployment blocked: CONFIRM_PROD must be YES")
                    }
                }
            }
        }
        stage('Git Checkout') {
            steps {
                echo 'Git Repo added'
                git branch: 'main', changelog: false, poll: false, url: 'https://github.com/saireddy220799/Testingdevopsassessment.git'
                echo 'Git repo checked and working successfully....'
            }
        }
        stage('Validate Git Version') {
            steps {
                bat """
                    git fetch --tags
                    git rev-parse refs/tags/v${params.VERSION}
                """
            }
        }
        stage('Identify Commit') {
            steps {
                script {
                    def commit = bat(
                        script: "git rev-list -n 1 refs/tags/v${params.VERSION}",
                        returnStdout: true
                    ).trim()
                    echo "Selected Git commit: ${commit}"
                }
            }
        }
        stage('Build Docker Image') {
            when {
                expression {
                    params.DEPLOYMENT_ACTION == 'DEPLOY'
                }
            }
            steps {
                bat """
                    "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" build -t ${IMAGE_NAME}:${params.VERSION} .
                """
            }
        }
        stage('Create Docker Network') {
            steps {
                bat """
                    "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" network inspect ${NETWORK_NAME} >nul 2>&1 || docker network create ${NETWORK_NAME}
                """
            }
        }
        stage('Record Previous Production') {
            steps {
                script {
                    def previous = bat(
                        script: """
                            "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" inspect ${CONTAINER_NAME} --format="{{.Config.Image}}"
                        """,
                        returnStdout: true
                    ).trim()
                    env.PREVIOUS_IMAGE = previous
                    echo "Previous production image: ${env.PREVIOUS_IMAGE}"
                }
            }
        }
        stage('Deploy New Version') {

            when {
                expression {
                    params.DEPLOYMENT_ACTION == 'DEPLOY'
                }
            }
            steps {
                bat """
                    "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" run -d ^
                    --name ${CONTAINER_NAME}-new ^
                    --network ${NETWORK_NAME} ^
                    -p ${PORT}:8082 ^
                    -e APP_VERSION=${params.VERSION} ^
                    -e ENVIRONMENT=${params.ENVIRONMENT} ^
                    ${IMAGE_NAME}:${params.VERSION}
                """
            }
        }
        stage('Health Check') {
            when {
                expression {
                    params.DEPLOYMENT_ACTION == 'DEPLOY'
                }
            }
            steps {
                script {
                    int maxAttempts = 12
                    boolean healthy = false
                    for (int i = 1; i <= maxAttempts; i++) {
                        def status = bat(
                            script: """
                                @echo off
                                "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" inspect --format="{{.State.Health.Status}}" ${CONTAINER_NAME}-new
                            """,
                            returnStdout: true
                        ).trim()
                        echo "Health check attempt ${i}: ${status}"
                        if (status == "healthy") {
                            healthy = true
                            echo "Container is healthy."
                            break
                        }
                        if (status == "unhealthy") {
                            echo "Container is unhealthy."
                            break
                        }
                        sleep 5
                    }
                    if (!healthy) {
                        currentBuild.result = 'FAILURE'
                        env.ROLLBACK_REQUIRED = 'true'

                        echo "v4.2.2 health check FAILED."
                        echo "Rollback is required."
                    }
                }
            }
        }

        stage('Switch Production') {
            when {
                expression {
                    params.DEPLOYMENT_ACTION == 'DEPLOY'
                }
            }
            steps {
                bat """
                    "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" stop ${CONTAINER_NAME} || exit 0
                    "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" rm ${CONTAINER_NAME} || exit 0
                    "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" rename ${CONTAINER_NAME}-new ${CONTAINER_NAME}
                """
            }
        }
        stage('Rollback') {
            when {
                expression {
                    params.DEPLOYMENT_ACTION == 'ROLLBACK' ||
                    env.ROLLBACK_REQUIRED == 'true'
                }
            }
            steps {
                script {
                    echo "Rollback requested"
                    echo "Restoring image: ${env.PREVIOUS_IMAGE}"
                    bat """
                        "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" stop ${CONTAINER_NAME} || exit 0
                        "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" rm ${CONTAINER_NAME} || exit 0
                        "C:/Users/DELL/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe" run -d ^
                        --name ${CONTAINER_NAME} ^
                        --network ${NETWORK_NAME} ^
                        -p ${PORT}:8081 ^
                        -e ENVIRONMENT=${params.ENVIRONMENT} ^
                        ${env.PREVIOUS_IMAGE}
                    """
                }
            }
        }
    }
    post {
        success {
            echo "======================================"
            echo "DEPLOYMENT SUCCESSFUL"
            echo "Version: ${params.VERSION}"
            echo "======================================"
        }
        failure {
            echo "======================================"
            echo "DEPLOYMENT FAILED"
            echo "Automatic rollback should be performed"
            echo "======================================"
        }
    }
}
