pipeline {
  agent any

  stages {

    stage('Sonarqube Analysis') {
      environment {
        scannerHome = tool 'sonarqube-scanner'
      }

      steps {
        withSonarQubeEnv(installationName: 'sonarqube') {
          sh '$scannerHome/bin/sonar-scanner'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 1, unit: 'HOURS') {
          waitForQualityGate abortPipeline: false
        }
      }
    }

    stage('Build Image - Push - Deploy') {
        when {
          branch "development"
            }
          steps {
             script {
                withCredentials([file(credentialsId: 'ait-k8s_kubeconfig', variable: 'CONFIG'), 
                usernamePassword(credentialsId: 'ait-k8s_docker-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                   sh 'docker login ait-cr.akarinti.tech --username=${USER} --password=${PASS}'
                   sh 'mkdir -p $HOME/.kube'
                   sh 'cat ${CONFIG} > ~/.kube/config'
                   sh 'skaffold run -n building-blocks'
               }
            }
         }
      }
  }

  post {
    failure {
      emailext subject: "Jenkins Build ${currentBuild.currentResult}: Job ${env.JOB_NAME}",
        body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}",
        recipientProviders: [
          [$class: 'DevelopersRecipientProvider'],
          [$class: 'RequesterRecipientProvider']
        ]
    }

    always {
      cleanWs()
    }
  }
}
