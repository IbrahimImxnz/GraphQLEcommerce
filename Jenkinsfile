pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build image') {
            steps {
                echo 'Building image of app'
                script {
                    bat 'docker build -t ibrahimmaaly/graphqlapp:latest .'
                }
            }
        }

        stage('Run Compose') {
            steps {
                script{
                    withCredentials([file(credentialsId: '.env', variable: 'ENV_FILE')]) {
                        bat 'copy %ENV_FILE% .env'
                    }
                    bat 'docker-compose -f dockerCompose.yml up --build -d'
                }
            }
        }

        stage('Push to Registry') {
            steps {
                script{
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: "DOCKERHUB_USERNAME", passwordVariable: "DOCKERHUB_PASSWORD")]){
                        bat 'docker login -u %DOCKERHUB_USERNAME% -p %DOCKERHUB_PASSWORD%'
                    }

                    bat 'docker push ibrahimmaaly/graphqlapp:latest'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    bat 'kubectl apply -f deployment.yml'
                    bat 'kubectl rollout status deployment/graphql-ecommerce'
                }
            }
        }
        /*
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
// tt 
  /*  post {
        /*
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
            )
        }
        failure {
            echo 'Build failed.'
            emailext (
            subject: "Jenkins Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build completed unsuccessfully. Check console output at ${env.BUILD_URL}.",
            to: "ibrahimpartey70@gmail.com",
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
    }*/
}