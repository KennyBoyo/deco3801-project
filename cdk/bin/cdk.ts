#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECStack } from '../lib/ec-stack';
import { ImageRepositoryStack } from '../lib/image-repository-stack';
import { DataStack } from '../lib/data-stack';


const tenant = process.env.TENANT || "expressedcode"
const distributionIdRef = `/private/${tenant}/web/distributionIdRef`
const distributionBucketRef = `/private/${tenant}/web/distributionBucketRef`
const distributionDomainRef = `/private/${tenant}/web/distributionDomainRef`
const ecrUriRef = `/platform/mediawiki/private/${tenant}/ecr/uri`
const ecrArnRef = `/platform/mediawiki/private/${tenant}/ecr/Arn`
const ecrNameRef = `/platform/mediawiki/private/${tenant}/ecr/Name`
const vpcIdRef = `/platform/mediawiki/private/${tenant}/vpc/id`
const dockerImageFilePath = './src/docker'

const app = new cdk.App();

const defaultStackEnv = { account: process.env.ACCOUNT_ID || "507587228925", region: process.env.ACCOUNT_REGION || "us-east-1" }

/**
 * Code commented out for docker implementation
 */
const imageRepositoryStack = new ImageRepositoryStack(
  app,
  'ImageRepositoryStack',
  {
    inputs: {
      dockerImageFilePath,
    },
    outputs: {
      ecrUriRef,
      ecrArnRef,
      ecrNameRef,
    },
    env: defaultStackEnv
  }
)

const ecstack = new ECStack(app, "ECStack", {
  inputs: {
    ecrArnRef,
    ecrNameRef,
    dockerImageFilePath,
  },
  outputs: {
    vpcIdRef
  },
  env: defaultStackEnv
})

ecstack.addDependency(imageRepositoryStack)

/**
 * Start up RDS with permissions given to deployed EC2 instance
 */
const datastack = new DataStack(app, "DataStack", {
  inputs: {
    vpcIdRef
  },
  env: defaultStackEnv
})
