#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebStack } from '../lib/web-stack';
import { StackProps } from 'aws-cdk-lib';
import { WebDeployStack } from '../lib/web-deploy-stack';
import { ECStack } from '../lib/ec-stack';
import { ImageRepositoryStack } from '../lib/image-repository-stack';

const tenant = 'jchooi'
const distributionIdRef = `/private/${tenant}/web/distributionIdRef`
const distributionBucketRef = `/private/${tenant}/web/distributionBucketRef`
const distributionDomainRef = `/private/${tenant}/web/distributionDomainRef`
const ecrUriRef = `/platform/mediawiki/private/${tenant}/ecr/uri`
const ecrArnRef = `/platform/mediawiki/private/${tenant}/ecr/Arn`
const ecrNameRef = `/platform/mediawiki/private/${tenant}/ecr/Name`
const dockerImageFilePath = './src/docker'

const app = new cdk.App();

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
    }
  }
)

const ecstack = new ECStack(app, "ECStack", {
  inputs: {
    ecrArnRef,
    ecrNameRef,
    dockerImageFilePath,
  }
})

ecstack.addDependency(imageRepositoryStack)

// const webstack = new WebStack(app, "Webstack", {
//   outputs: {
//     distributionIdRef,
//     distributionBucketRef,
//     distributionDomainRef,
//   }
// })

// const webDeployStack = new WebDeployStack(app, 'WebDeployStack', {
//   inputs: {
//     distributionIdRef,
//     distributionBucketRef,
//     distributionDomainRef,
//   }
// })

// webDeployStack.addDependency(webstack)

