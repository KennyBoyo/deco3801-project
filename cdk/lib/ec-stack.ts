
import { Aws, Stack, StackProps } from 'aws-cdk-lib'
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import * as ecrdeploy from 'cdk-ecr-deployment';
import * as path from 'path';


export class ECStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
    
        // The code that defines your stack goes here
    
        // example resource
        // const queue = new sqs.Queue(this, 'CdkQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });
        const image = new DockerImageAsset(this, 'CDKDockerImage', {
            directory: path.join(__dirname, 'docker'),
        });
    
        new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
        src: new ecrdeploy.DockerImageName(image.imageUri),
        dest: new ecrdeploy.DockerImageName(`${Aws.ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/test:nginx`),
        });
      }
}