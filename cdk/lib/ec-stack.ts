
import { Aws, Stack, StackProps, aws_ecs_patterns, Duration, CfnOutput } from 'aws-cdk-lib';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { AmazonLinuxGeneration, AmazonLinuxImage, IMachineImage, Instance, InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, Ec2Service, Ec2TaskDefinition, NetworkMode } from 'aws-cdk-lib/aws-ecs';
import { DockerImageName, ECRDeployment } from 'cdk-ecr-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { readFileSync } from 'fs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

type ECStackProps = {
    inputs: {
        ecrArnRef: string
        ecrNameRef: string
        dockerImageFilePath: string
    },
    outputs: {
        vpcIdRef: string
    }
} & StackProps


export class ECStack extends Stack {
    constructor(scope: Construct, id: string, props: ECStackProps) {
        super(scope, id, props);
    
        // const repositoryName = StringParameter.valueForStringParameter(
        //     this,
        //     props.inputs.ecrNameRef
        // )
        // const repositoryArn = StringParameter.valueForStringParameter(
        //     this,
        //     props.inputs.ecrArnRef
        // )

         // 👇 create VPC in which we'll launch the Instance
        const vpc = new Vpc(this, 'mediawiki-vpc', {
            cidr: '10.0.0.0/16',
            natGateways: 0,
            subnetConfiguration: [
            {name: 'public', cidrMask: 24, subnetType: SubnetType.PUBLIC},
            ],
        });

        // // Get ECR instance and upload image
        // const ecrRepository = Repository.fromRepositoryAttributes(
        //     this,
        //     'MediawikiECRRepository',
        //     {
        //         repositoryName,
        //         repositoryArn,
        //     },
        // )

        // const dockerImageAsset = new DockerImageAsset( this, 'MediawikiDockerImageAsset', {
        //     directory: props.inputs.dockerImageFilePath,
        // })

        // new ECRDeployment(this, 'DeployMediawikiDockerImage', {
        //     src: new DockerImageName(dockerImageAsset.imageUri),
        //     dest: new DockerImageName(ecrRepository.repositoryUri),
        // })
    
        // 👇 create Security Group for the Instance
        const webserverSG = new SecurityGroup(this, 'mediawiki-sg', {
            vpc,
            allowAllOutbound: true,
        });
    
        webserverSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(22),
            'allow SSH access from anywhere',
        );
    
        webserverSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(80),
            'allow HTTP traffic from anywhere',
        );
    
        webserverSG.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(443),
            'allow HTTPS traffic from anywhere',
        );

        const role = new Role(this, 'mediawiki-instance-role', {
            assumedBy: new ServicePrincipal('ec2.amazonaws.com')
        });

        role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'))

        const ec2Instance = new Instance(this, 'mediawiki-instance', {
            vpc,
            vpcSubnets: {
            subnetType: SubnetType.PUBLIC,
            },
            securityGroup: webserverSG,
            instanceType: InstanceType.of(
            InstanceClass.T3A,
            InstanceSize.MICRO,
            ),
            machineImage: new AmazonLinuxImage({
            generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            keyName: 'mediawiki',
            role,
        });

        // 👇 load contents of script
        const userDataScript = readFileSync('src/scripts/start.sh', 'utf8');
        // 👇 add the User Data script to the Instance
        ec2Instance.addUserData(userDataScript);

        // // 👇 create the VPC
        // const vpc = new Vpc(this, 'mediawiki-vpc', {
        //     cidr: '10.0.0.0/16',
        //     natGateways: 1,
        //     maxAzs: 3,
        //     subnetConfiguration: [
        //       {
        //         name: 'public-subnet-1',
        //         subnetType: SubnetType.PUBLIC,
        //         cidrMask: 24,
        //       },
        //     ],
        //   });
          
        // // Get ECR instance and upload image
        // const ecrRepository = Repository.fromRepositoryAttributes(
        //     this,
        //     'MediawikiECRRepository',
        //     {
        //         repositoryName,
        //         repositoryArn,
        //     },
        // )

        // const dockerImageAsset = new DockerImageAsset( this, 'MediawikiDockerImageAsset', {
        //     directory: props.inputs.dockerImageFilePath,
        //     // file: './Dockerfile',
        // })

        // new ECRDeployment(this, 'DeployMediawikiDockerImage', {
        //     src: new DockerImageName(dockerImageAsset.imageUri),
        //     dest: new DockerImageName(ecrRepository.repositoryUri),
        // })

        // // // Configure Cluster
        // const cluster = new Cluster(this, 'MediawikiCluster', {vpc});
        // cluster.addCapacity('MediawikiASGCapacity', {
        //     instanceType: new InstanceType("t2.micro"),
        //     desiredCapacity: 1,
        //     vpcSubnets: {subnetType: SubnetType.PUBLIC}
        //   });
        // const taskDefinition = new Ec2TaskDefinition(this, 'MediawikiTaskDef', {networkMode: NetworkMode.AWS_VPC});
        // taskDefinition.addContainer('MediawikiContainer', {
        //     image: ContainerImage.fromEcrRepository(ecrRepository),
        //     memoryLimitMiB: 1024,
        // });
        // taskDefinition.defaultContainer?.addPortMappings({
        //     containerPort: 3000,
        // })

        // const ec2Service = new aws_ecs_patterns.ApplicationLoadBalancedEc2Service(this, 'MediawikiECS', {
        // cluster,
        // memoryLimitMiB: 1024,
        // // taskImageOptions: {
        // //     image: ContainerImage.fromEcrRepository(ecrRepository),
        // // },
        // // taskImageOptions: {
        // //     image: ContainerImage.fromEcrRepository(ecrRepository),
        // //     environment: {
        // //     TEST_ENVIRONMENT_VARIABLE1: "test environment variable 1 value",
        // //     TEST_ENVIRONMENT_VARIABLE2: "test environment variable 2 value",
        // //     },
        // // },
        // taskDefinition
        // });

        
        // // const scaling = ec2Service.service.autoScaleTaskCount({
        // //     maxCapacity: 2,
        // // })
        // // scaling.scaleOnCpuUtilization('CpuScaling', {
        // //     targetUtilizationPercent: 50,
        // //     scaleInCooldown: Duration.seconds(60),
        // //     scaleOutCooldown: Duration.seconds(60),
        // // })

        // // new CfnOutput(this, 'LoadBalancerDNS', {
        // //     value: ec2Service.loadBalancer.loadBalancerName,
        // // })


        // new StringParameter(this, 'VPCIdRef', {
        //     parameterName: props.outputs.vpcIdRef,
        //     stringValue: vpc.vpcId,
        // })

        // // const service = new Ec2Service(this, 'Service', { cluster, taskDefinition });

        // // const lb = new LoadBalancer(this, 'LB', { vpc });
        // // lb.addListener({ externalPort: 80 });

        // // // Create an ECS cluster
        // // const cluster = new Cluster(this, 'Cluster', {
        // //     vpc,
        // // });
        
        // // // Add capacity to it
        // // cluster.addCapacity('DefaultAutoScalingGroupCapacity', {
        // //     instanceType: new InstanceType("t2.xlarge"),
        // //     desiredCapacity: 3,
        // // });
        
        // // const taskDefinition = new Ec2TaskDefinition(this, 'TaskDef');
        
        // // taskDefinition.addContainer('DefaultContainer', {
        // //     image: ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
        // //     memoryLimitMiB: 512,
        // // });
        
        // // // Instantiate an Amazon ECS Service
        // // const ecsService = new Ec2Service(this, 'Service', {
        // //     cluster,
        // //     taskDefinition,
        // // });
        // // const cluster = new Cluster(this, "MyCluster", {
        // //     vpc: vpc
        // //   });
      
        // //   // Create a load-balanced Fargate service and make it public
        // //   new ApplicationLoadBalancedFargateService(this, "MyFargateService", {
        // //     cluster: cluster, // Required
        // //     cpu: 512, // Default is 256
        // //     desiredCount: 6, // Default is 1
        // //     taskImageOptions: { image: ContainerImage.fromEcrRepository(ecrRepository) },
        // //     memoryLimitMiB: 2048, // Default is 512
        // //     publicLoadBalancer: true // Default is true
        // //   });
      }
}