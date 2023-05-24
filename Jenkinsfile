static String newPath(env) {
  return "${env.PATH}:/usr/local/bin"
}

pipeline {
  agent any
    environment {
      SERVICE_TARGET_PORT = 80
      NAMESPACE = "building-blocks"
      PATH = newPath(env)
      ALLOWED_BRANCH = "development"
    }

  stages {

    stage('Check Commit') {
      steps {
        script {
          result = sh (script: "git log -1 | grep -E '(feat|build|chore|fix|docs|refactor|perf|style|test)(\\(.+\\))*:'", returnStatus: true)
          if (result != 0) {
            echo "warning, not meet commit standard!"
          }
        }
      }
    } 

    stage('Sonarqube Analysis') {
      when { anyOf { branch "$ALLOWED_BRANCH" } }
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
      when { anyOf { branch "$ALLOWED_BRANCH" } }
      steps {
        timeout(time: 1, unit: 'HOURS') {
          waitForQualityGate abortPipeline: false
        }
      }
    }

    stage('Snyk Scan for Code') {
      when { anyOf { branch "$ALLOWED_BRANCH" } }
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'aitops', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME'), file(credentialsId: 'snyk-sh', variable: 'SNYK_SH')]) {
            sh "cat ${SNYK_SH} > ./snyk.sh && chmod +x snyk.sh && /bin/bash -c ./snyk.sh"
          }
          def now = new Date()
          time = now.format("yyMMdd.HHmm", TimeZone.getTimeZone('Asia/Jakarta'))
          publishHTML (target: [allowMissing: false, alwaysLinkToLastBuild: true, keepAll: true, reportDir: '.',  reportFiles: 'snyk.html', reportName: "SnykCodeReports.${time}.html", reportTitles: "Snyk Code Reports ${time}"])
          numberofline = sh(script: "egrep '(0</strong> low issues|0</strong> medium issues|0</strong> high issues)' snyk.html | wc -l", returnStdout: true).trim()
          if (numberofline != '3') {
            echo " Vulnerabilities Found!!!! "
            catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') { sh 'exit 1' }
          } else { echo " === No Vulnerability Found === " }
          println "Scan Result can be viewed via ${env.RUN_ARTIFACTS_DISPLAY_URL}"
        }
      }
    } 

    stage('Snyk Open Source Vulnerability'){
      when { anyOf { branch "$ALLOWED_BRANCH" } }
      steps {
        script {
          def now = new Date()
          time = now.format("yyMMdd.HHmm", TimeZone.getTimeZone('Asia/Jakarta'))
          publishHTML (target: [allowMissing: false, alwaysLinkToLastBuild: true, keepAll: true, reportDir: '.',  reportFiles: 'snykOS.html', reportName: "SnykOpenSourceVulnerabilityReports.${time}.html", reportTitles: "Snyk Open Source Vulnerability Reports ${time}"])
          numberofline = sh(script: "egrep '(0</span> <span>known vulnerabilities|0 vulnerable dependency paths</span>)' snykOS.html | wc -l", returnStdout: true).trim()
          if (numberofline != '2') {
            echo " Vulnerabilities Found!!!! "
            catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') { sh 'exit 1' }
          } else { echo " === No Vulnerability Found === " }
          println "Scan Result can be viewed via ${env.RUN_ARTIFACTS_DISPLAY_URL}"
        }
      }
    }

    stage('Build Image - Push - Deploy') {
      when { anyOf { branch "$ALLOWED_BRANCH" } }
      steps {
        script {
          withCredentials([file(credentialsId: 'ait-k8s-do', variable: 'KUBECONFIG'),
            usernamePassword(credentialsId: 'aitops-docker-io', usernameVariable: 'USER', passwordVariable: 'PASS'),
            file(credentialsId: 'cicd-prep', variable: 'CICD_PREP')]) {
            sh 'docker login --username=${USER} --password=${PASS}'
            sh "cat ${CICD_PREP} > ./cicd-prep.sh && chmod +x cicd-prep.sh && /bin/bash -c ./cicd-prep.sh"
            sh 'export KUBECONFIG=$KUBECONFIG && skaffold run -n $NAMESPACE'
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

    always { cleanWs() }
  }
}
