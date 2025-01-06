/// Jenkinsfile for Blueverse Backend
def COLOR_MAP = [
    'SUCCESS': 'good',
    'FAILURE': 'danger',
    'UNSTABLE': 'warning'
]
def MESSAGES_MAP = [
    'SUCCESS': "success",
    'FAILURE': "failed",
    'UNSTABLE': "unstable"
]
pipeline {
    agent any
    options {
        // fail build if takes more than 30 minutes, mark reason as build timeout
        timeout(time: 15, unit: 'MINUTES')
        // Keep the 10 most recent builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Don't run any stage if found to be unstable
        skipStagesAfterUnstable()
    }
    environment {
        DISPLAY_SERVICE_NAME    = 'Blueverse Backend'
        BRANCH_NAME             = sh(script: "echo ${env.BRANCH_NAME}", returnStdout: true).trim()
    }
    stages {
        stage('SCM Checkout') {
            steps {
                checkout scm
            }
        }
        stage("Environment Variables") {
            steps {
                sh "printenv"
            }
        }
        stage('Deploy to Digital Ocean') {
            parallel {
                stage('Deploying to Environment') {
                    when {
                        expression { return BRANCH_NAME == 'develop' || BRANCH_NAME == 'qa' || BRANCH_NAME == 'staging' }
                    }
                    steps {
                        sshagent(credentials : ['nhp-backend-digital-ocean']) {
                            sh 'ssh -o StrictHostKeyChecking=no ubuntu@52.5.27.40 uptime'
                            sh """ ssh ubuntu@52.5.27.40 "cd projects/blueverse/${BRANCH_NAME}/; git reset --hard && git pull origin ${BRANCH_NAME} && chmod +x ./script.sh && ./script.sh ${BRANCH_NAME}" """
                        }
                    }
                }
                stage('Deploying to Bluvere-prod') {
                    when {
                        expression { return  BRANCH_NAME == 'stage-prod' || BRANCH_NAME == 'master' }
                    }
                    steps {
                        sshagent(credentials : ['bluverse-prod-server']) {
                            sh 'ssh -o StrictHostKeyChecking=no ubuntu@52.45.75.61 uptime'
                            sh """ ssh ubuntu@52.45.75.61 "cd blueverse/${BRANCH_NAME}/; git reset --hard && git pull origin ${BRANCH_NAME} && chmod +x ./script.sh && ./script.sh ${BRANCH_NAME}" """
                        }
                    }
                }
            }
        }
    }
}
