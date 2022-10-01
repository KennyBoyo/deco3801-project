import { Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from "aws-cdk-lib/aws-ecr";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
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