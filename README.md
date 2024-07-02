Welcome to the Project Deployment Service! This service is designed to streamline and simplify the deployment of web applications by leveraging Docker for dependency management and AWS for hosting and scalability. Whether you're a seasoned developer or just getting started, our service provides a reliable, user-friendly platform to deploy your projects with ease.
Features
  -Docker Integration: Consistent dependency management and environment consistency using Docker.
  -AWS S3: Reliable hosting for static assets with global distribution.
  -AWS ECS and ECR: Scalable container management and secure image storage.
  -Real-time Deployment Logs: Monitor deployment process live and store logs for future reference.
  -User-friendly Interface: Comprehensive dashboard for easy project management and tracking.

Installation:
1)clone the repository intoyour local machine
2)create AWS account
3)create a new S3 bucket
4)cofigure IAM user and add permissions for it
5)create a new cluster service and create new task definition for it.
6)create the new image in ECR service for the Dockerfile
7)Follow the instructions to push the image into ecr
8)run the backend and frontend separately
