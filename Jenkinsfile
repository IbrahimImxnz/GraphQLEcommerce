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
                bat 'npm i'
            }
        }
        stage('Run Lint') {
            steps {
                script {
                    try {
                        bat 'npm run lint'
                    } catch (Exception e) {
                        currentBuild.result = 'UNSTABLE'
                        echo 'Jslint errors occurred' 
                    }
                } // this way jslint will not stop the build anymore if an error occurs
            }
        }
        stage('Run Tests') {
            steps {
                bat "npm test"
            }
        }
        /*
        stage('Run nodemon dev server'){
            steps {
                bat 'npm run devStart'
            }
        } */ // testing nodemon
    }
// t
    post {
        always { // always archvie even if failure occurs
            archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true // save all coverage file and if empty continue
            echo 'Coverage logs have been archived.'
        }
        success {
            echo 'Build succeeded!'
            emailext (
            subject: "Jenkins Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build completed successfully. Check console output at ${env.BUILD_URL}.",
            to: "ibrahimpartey70@gmail.com",
            from: "ibrahimpartey70@gmail.com"
            )
        }
        failure {
            echo 'Build failed.'
            emailext (
            subject: "Jenkins Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build completed unsuccessfully. Check console output at ${env.BUILD_URL}.",
            to: "ibrahimpartey70@gmail.com",
            from: "ibrahimpartey70@gmail.com"
            )
        }
        unstable {
            echo 'Build unstable.'
            emailext (
            subject: "Jenkins Build Unstable: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build is completed but unstable. Check console output at ${env.BUILD_URL}.",
            to: "ibrahimpartey70@gmail.com",
            from: "ibrahimpartey70@gmail.com"
            )
        }
    }
}