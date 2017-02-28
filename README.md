# Tomcat Hello World Sample

This project contains a simple servlet application.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/IBM-Bluemix/java-tomcat-helloworld)

## Run the app locally

1. [Install Apache Maven][]
+ [Install Apache Tomcat][]
+ cd into this project's root directory
+ Run `mvn clean install` to build the `target/upload-frontapp.war` file
+ Copy `target/upload-frontapp.war` to your Tomcat's `webapps` folder
+ Start Tomcat by running its `bin/startup.sh` script
+ Access the running app in a browser at <http://localhost:8080/upload-frontapp/>
 
[Install Apache Maven]: http://maven.apache.org/
[Install Apache Tomcat]: http://tomcat.apache.org/
