
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AmazonLinuxGeneration, AmazonLinuxImage, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
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
      const vpc = new Vpc(this, 'mediawiki-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 0,
        maxAzs: 3,
        subnetConfiguration: [
          {
            name: 'public-subnet-1',
            subnetType: SubnetType.PUBLIC,
            cidrMask: 24,
          }
        ],
      });

      // 👇 create a security group for the EC2 instance
      const ec2InstanceSG = new SecurityGroup(this, 'mediawiki-instance-sg', {
        vpc,
      });

      ec2InstanceSG.addIngressRule(
        Peer.anyIpv4(),
        Port.tcp(22),
        'allow SSH connections from anywhere',
      );

      ec2InstanceSG.addIngressRule(
        Peer.anyIpv4(),
        Port.tcp(80),
        'allow HTTP traffic from anywhere',
      );

      ec2InstanceSG.addIngressRule(
        Peer.anyIpv4(),
        Port.tcp(443),
        'allow HTTPS traffic from anywhere',
      );

      // 👇 create the EC2 instance
      const ec2Instance = new Instance(this, 'mediawiki-instance', {
        vpc,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        securityGroup: ec2InstanceSG,
        instanceType: InstanceType.of(
          InstanceClass.T2,
          InstanceSize.MICRO,
        ),
        machineImage: new GenericLinuxImage({
          'us-east-1': 'ami-05cf62c5375f68022'
          // 'us-east-1': 'ami-0101f692e19268402'
        }),
        keyName: "mediawiki"
      });

      // 👇 create RDS instance
      const dbInstance = new DatabaseInstance(this, 'mediawiki-db-instance', {
        vpc,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_8_0_28
        }),
        instanceType: InstanceType.of(
          InstanceClass.BURSTABLE3,
          InstanceSize.MICRO,
          // InstanceClass.T2,
          // InstanceSize.MICRO,
        ),
        credentials: Credentials.fromGeneratedSecret('mediawiki'),
        multiAz: false,
        allocatedStorage: 100,
        maxAllocatedStorage: 105,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: true,
        backupRetention: Duration.days(0),
        deleteAutomatedBackups: true,
        removalPolicy: RemovalPolicy.DESTROY,
        deletionProtection: false,
        databaseName: 'mediawikidb',
        publiclyAccessible: true,
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