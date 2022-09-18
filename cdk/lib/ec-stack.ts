
import { Aws, Stack, StackProps, aws_ecs_patterns, Duration, CfnOutput } from 'aws-cdk-lib';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { IMachineImage, Instance, InstanceClass, InstanceSize, InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, Ec2Service, Ec2TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { DockerImageName, ECRDeployment } from 'cdk-ecr-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

type ECStackProps = {
    inputs: {
        ecrArnRef: string
        ecrNameRef: string
        dockerImageFilePath: string
    }
} & StackProps


export class ECStack extends Stack {
    constructor(scope: Construct, id: string, props: ECStackProps) {
        super(scope, id, props);
    
        const repositoryName = StringParameter.valueForStringParameter(
            this,
            props.inputs.ecrNameRef
        )
        const repositoryArn = StringParameter.valueForStringParameter(
            this,
            props.inputs.ecrArnRef
        )

        // VPC
        const vpc = new Vpc(this, 'VPC', {
            cidr: "10.0.0.0/16"
        })
          
        // Get ECR instance and upload image
        const ecrRepository = Repository.fromRepositoryAttributes(
            this,
            'EcrRepository',
            {
                repositoryName,
                repositoryArn,
            },
        )

        const dockerImageAsset = new DockerImageAsset( this, 'DockerImageAsset', {
            directory: props.inputs.dockerImageFilePath,
            // file: './Dockerfile',
        })

        new ECRDeployment(this, 'DeployDockerImage', {
            src: new DockerImageName(dockerImageAsset.imageUri),
            dest: new DockerImageName(ecrRepository.repositoryUri),
        })

        // Configure Cluster
        const cluster = new Cluster(this, 'ECSCluster', {vpc});
        cluster.addCapacity('DefaultAutoScalingGroupCapacity', {
            instanceType: new InstanceType("t2.micro"),
            desiredCapacity: 1,
          });
        const taskDefinition = new Ec2TaskDefinition(this, 'TaskDef');
        taskDefinition.addContainer('TheContainer', {
            image: ContainerImage.fromEcrRepository(ecrRepository),
            memoryLimitMiB: 256
        });

        const ec2Service = new aws_ecs_patterns.ApplicationLoadBalancedEc2Service(this, 'Service', {
        cluster,
        memoryLimitMiB: 1024,
        taskImageOptions: {
            image: ContainerImage.fromEcrRepository(ecrRepository),
            environment: {
            TEST_ENVIRONMENT_VARIABLE1: "test environment variable 1 value",
            TEST_ENVIRONMENT_VARIABLE2: "test environment variable 2 value",
            },
        },
        desiredCount: 2,
        });

        
        const scaling = ec2Service.service.autoScaleTaskCount({
            maxCapacity: 2,
        })
        scaling.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 50,
            scaleInCooldown: Duration.seconds(60),
            scaleOutCooldown: Duration.seconds(60),
        })

        new CfnOutput(this, 'LoadBalancerDNS', {
            value: ec2Service.loadBalancer.loadBalancerName,
        })


        // const service = new Ec2Service(this, 'Service', { cluster, taskDefinition });

        // const lb = new LoadBalancer(this, 'LB', { vpc });
        // lb.addListener({ externalPort: 80 });
      }
}