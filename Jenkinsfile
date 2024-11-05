pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm i'
            }
        }
        stage('Run Tests') {
            steps {
                sh "npm test"
            }
        }
        /*
        stage('Run nodemon dev server'){
            steps {
                sh 'npm run devStart'
            }
        } */ // testing nodemon
    }

    post {
        always { // always archvie even if failure occurs
            archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true // save all coverage file and if empty continue
            echo 'Coverage logs have been archived.'
        }
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed.'
        }
    }
}