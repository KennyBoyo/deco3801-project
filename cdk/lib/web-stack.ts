import { App, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface WebStackProps extends StackProps {
    outputs: {
        distributionIdRef: string,
        distributionDomainRef: string,
        distributionBucketRef: string,
    }
}

export class WebStack extends Stack {
    constructor(scope: App, id: string, props: WebStackProps) {
        super(scope, id, props)

        const webBucket = new Bucket(this, 'WebBucket', {
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        })

        const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity')

        webBucket.addToResourcePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                principals: [originAccessIdentity.grantPrincipal],
                actions: ['s3:GetObject'],
                resources: [`${webBucket.bucketArn}/*`],
            })
        )

        const distribution = new Distribution(this, 'WebDistribution', {
            defaultBehavior: {
                origin: new S3Origin(webBucket, {originAccessIdentity}),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',

            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(30),
                }
            ]
        })

        new StringParameter(this, 'WebDistributionId', {
            parameterName: props.outputs.distributionIdRef,
            stringValue: distribution.distributionId
        })

        new StringParameter(this, 'WebDistributionDomain', {
            parameterName: props.outputs.distributionDomainRef,
            stringValue: distribution.distributionDomainName
        })

        new StringParameter(this, 'WebDistributionBucket', {
            parameterName: props.outputs.distributionBucketRef,
            stringValue: webBucket.bucketArn
        })
    }
}