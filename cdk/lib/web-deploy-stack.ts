import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
export interface WebDeployStackProps extends StackProps {
    inputs: {
        distributionIdRef: string,
        distributionDomainRef: string,
        distributionBucketRef: string,
    }
}

export class WebDeployStack extends Stack {
    constructor(scope: App, id: string, props: WebDeployStackProps) {
        super(scope, id, props)

        const distributionId = StringParameter.valueForStringParameter(
            this,
            props.inputs.distributionIdRef
        )

        const distributionDomain = StringParameter.valueForStringParameter(
            this,
            props.inputs.distributionDomainRef
        )

        const distributionBucket = StringParameter.valueForStringParameter(
            this,
            props.inputs.distributionBucketRef
        )

        const destinationBucket = Bucket.fromBucketArn(
            this,
            'DeploymentDistributionBucket',
            distributionBucket
        )

        const distribution = Distribution.fromDistributionAttributes(
            this,
            'DeploymentDistribution',
            { distributionId, domainName: distributionDomain }
        )

        new BucketDeployment(this, 'WebDeployBucket', {
            sources: [Source.asset('build')],
            destinationBucket,
            distribution,
            distributionPaths: ['/*'],
            retainOnDelete: false,
        })
    }
}