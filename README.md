
<!--

title: 'Serverless Framework Node Express API service backed by DynamoDB on AWS'

description: 'This template demonstrates how to develop and deploy a simple Node Express API service backed by DynamoDB running on AWS Lambda using the Serverless Framework.'

layout: Doc

framework: v4

platform: AWS

language: nodeJS

priority: 1

authorLink: 'https://github.com/serverless'

authorName: 'Serverless, Inc.'

authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'

-->

  

# Serverless Framework Node Express API on AWS

  

This template demonstrates how to develop and deploy a simple Node Express API service, backed by DynamoDB table, running on AWS Lambda using the Serverless Framework.

  

### Short architecture summary

This project is built using a **Serverless architecture** on **AWS**, designed for scalability, low maintenance, and pay-per-use efficiency.

  

**AWS Services Used:**

  

-  **AWS Lambda** – Runs the Node.js backend code without managing servers.

-  **API Gateway (HTTP API)** – Exposes RESTful endpoints and routes incoming HTTP requests to Lambda.

-  **DynamoDB** – NoSQL database used to store user data, notes, and metadata.

-  **CloudWatch** – Monitors logs, performance, and API metrics for debugging and observability.

-  **IAM (Identity and Access Management)** – Defines permissions for Lambda to securely access DynamoDB and CloudWatch.

  

## Local Setup

  

Install AWS CLI Locally Based On Your Operating System. Refer To This URL

[AWS CLI Installation Link](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

  

Configure AWS CLI

  

aws configure

  

- Input Your AWS Access Key ID

- AWS Secret Access Key

- Default Region Name

- Default Output Format

  

Install The Serverless Framework Via NPM

  

First, you must have the [Node.js runtime](https://nodejs.org/) installed, then you can install the Serverless Framework via NPM.

  

Open your CLI and run the command below to install the Serverless Framework globally.

```
npm i serverless -g
```

  

### Clone The Repo

```
git clone https://github.com/srirama-chandra/serverless-node-app.git
```

  

### Install The Packages

```
npm i
```

### Update The Environment Variables

Refer To The env.example file and create an .env file. Update the .env with your secrets

  

### Local development ( Needs AWS Account Though )

  

The easiest way to develop and test your function is to use the `dev` command:

  

```
serverless dev
```

  

This will start a local emulator of AWS Lambda and tunnel your requests to and from AWS Lambda, allowing you to interact with your function as if it were running in the cloud.

  

Now you can invoke the function as before, but this time the function will be executed locally. Now you can develop your function locally, invoke it, and see the results immediately without having to re-deploy.

  

### Postman Collections

  

Use The Postman Collections JSON File Present In ./postman folder and Import It Locally On Postman application.

**Or**

Directly Access Collection From This URL And Import It In Postman Locally

[Postman Collection URL](https://raw.githubusercontent.com/srirama-chandra/serverless-node-app/2e708603eb6ffb7c3bd7193532f0bc18c0614bb1/postman/Serverless-node-app-collection.postman_collection.json)

  

### Deployment

 
and then deploy with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "aws-node-express-dynamodb-api" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-express-dynamodb-api-dev (109s)

endpoint: ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com

functions:

api: aws-node-express-dynamodb-api-dev-api (3.8 MB)

```