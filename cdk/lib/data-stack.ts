
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AmazonLinuxGeneration, AmazonLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, MysqlEngineVersion, PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

type DataStackProps = {
  inputs: {
      vpcIdRef: string
  }
} & StackProps


export class DataStack extends Stack {
  constructor(scope: Construct, id: string, props: DataStackProps) {
      super(scope, id, props);
      
      const vpcId = StringParameter.valueFromLookup(
        this,
        props.inputs.vpcIdRef
      )

      // // Create the VPC
      // const vpc = Vpc.fromLookup(this, "vpc", {
      //   vpcId,
      // })

      // 👇 create the VPC
      const vpc = new Vpc(this, 'rds-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 0,
        maxAzs: 3,
        subnetConfiguration: [
          {
            name: 'public-subnet-1',
            subnetType: SubnetType.PUBLIC,
            cidrMask: 24,
          },
          {
            name: 'isolated-subnet-1',
            subnetType: SubnetType.PRIVATE_ISOLATED,
            cidrMask: 28,
          },
        ],
      });

      // 👇 create a security group for the EC2 instance
      const ec2InstanceSG = new SecurityGroup(this, 'ec2-instance-sg', {
        vpc,
      });

      ec2InstanceSG.addIngressRule(
        Peer.anyIpv4(),
        Port.tcp(22),
        'allow SSH connections from anywhere',
      );

      // 👇 create the EC2 instance
      const ec2Instance = new Instance(this, 'ec2-instance', {
        vpc,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        securityGroup: ec2InstanceSG,
        instanceType: InstanceType.of(
          InstanceClass.BURSTABLE2,
          InstanceSize.MICRO,
        ),
        machineImage: new AmazonLinuxImage({
          generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        keyName: "mysql-kp"
      });

      // 👇 create RDS instance
      const dbInstance = new DatabaseInstance(this, 'db-instance', {
        vpc,
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_8_0_28
        }),
        instanceType: InstanceType.of(
          // ec2.InstanceClass.BURSTABLE3,
          // InstanceSize.MICRO,
          InstanceClass.T2,
          InstanceSize.MICRO,
        ),
        credentials: Credentials.fromGeneratedSecret('postgres'),
        multiAz: false,
        allocatedStorage: 100,
        maxAllocatedStorage: 105,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: true,
        backupRetention: Duration.days(0),
        deleteAutomatedBackups: true,
        removalPolicy: RemovalPolicy.DESTROY,
        deletionProtection: false,
        databaseName: 'todosdb',
        publiclyAccessible: false,
      });

      dbInstance.connections.allowFrom(ec2Instance, Port.tcp(5432));

      new CfnOutput(this, 'dbEndpoint', {
        value: dbInstance.instanceEndpoint.hostname,
      });

      new CfnOutput(this, 'secretName', {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        value: dbInstance.secret?.secretName!,
      });
    }
  }