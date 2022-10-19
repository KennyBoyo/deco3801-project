import { Stack, StackProps } from 'aws-cdk-lib';
import { CfnPublicRepository, Repository } from "aws-cdk-lib/aws-ecr";
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { DockerImageName, ECRDeployment } from 'cdk-ecr-deployment';
import { Construct } from "constructs";

export type ImageRepositoryStackProps = {
    inputs: {
        dockerImageFilePath: string
    }
    outputs: {
        ecrUriRef: string
        ecrArnRef: string
        ecrNameRef: string
    }
} & StackProps

export class ImageRepositoryStack extends Stack {
    constructor(scope: Construct, id: string, props: ImageRepositoryStackProps) {
        super(scope, id, props)

        const imageRepository: Repository = new Repository(
            this,
            'ImageRepository',
            {
                repositoryName: 'mediawiki-image-repository',
                imageScanOnPush: true,
            }
        )

        const dockerImageAsset = new DockerImageAsset( this, 'MediawikiDockerImageAsset', {
            directory: props.inputs.dockerImageFilePath,
        })

        new ECRDeployment(this, 'DeployMediawikiDockerImage', {
            src: new DockerImageName(dockerImageAsset.imageUri),
            dest: new DockerImageName(imageRepository.repositoryUri),
        })

        // DO I NEED TO ADD IAM PERMISSIONS?

        new StringParameter(this, 'MediawikiImageRepositoryUri', {
            parameterName: props.outputs.ecrUriRef,
            stringValue: imageRepository.repositoryUri,
        })
        new StringParameter(this, 'MediawikiImageRepositoryArn', {
            parameterName: props.outputs.ecrArnRef,
            stringValue: imageRepository.repositoryArn,
        })
        new StringParameter(this, 'MediawikiImageRepositoryName', {
            parameterName: props.outputs.ecrNameRef,
            stringValue: imageRepository.repositoryName,
        })
    }
}