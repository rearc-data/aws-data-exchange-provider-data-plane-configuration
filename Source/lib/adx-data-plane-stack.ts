import * as cdk from '@aws-cdk/core';

import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

export class ADXDataPlaneStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const assetBucketName = new cdk.CfnParameter(this, 'AssetBucketName', {
      type: 'String',
      default: 'rearc-data-provider',
      description: 'Bucket containing assets and referenced in the manifest.'
    });

    const createAssetBucket = new cdk.CfnParameter(this, 'CreateAssetBucket', {
      type: 'String',
      allowedValues: ['true', 'false'],
      description: 'Defines if the asset bucket should be provisioned.'
    });

    const controlPlaneAccount = new cdk.CfnParameter(this, 'ControlPlaneAccount', {
      type: 'String',
      description: 'ID of the control plane account to connect to.'
    });

    const externalId = new cdk.CfnParameter(this, 'ExternalId', {
      type: 'String',
      description: 'External ID for connecting to the control plane - provided during onboarding.'
    });

    const assetBucket = this.setupAssetBucket(assetBucketName, createAssetBucket);

    const crossAccountRole = new iam.Role(this, 'CrossAccountRole', {
      assumedBy: new iam.PrincipalWithConditions(new iam.AccountPrincipal(controlPlaneAccount.valueAsString), {
        'StringEquals': {
          'sts:ExternalId': externalId.valueAsString
        }
      }),
      path: '/'
    });

    crossAccountRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dataexchange:GetDataSet',
        'dataexchange:ListDataSets',
        'dataexchange:UpdateRevision',
        'dataexchange:ListJobs',
        'dataexchange:GetJob',
        'dataexchange:CreateAsset',
        'dataexchange:GetRevision',
        'dataexchange:CreateJob',
        'dataexchange:CreateRevision',
        'dataexchange:UpdateDataSet',
        'dataexchange:UpdateAsset',
        'dataexchange:StartJob',
        'dataexchange:ListDataSetRevisions'
      ],
      resources: ['*']
    }));

    crossAccountRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'aws-marketplace:ListChangeSets',
        'aws-marketplace:DescribeChangeSet',
        'aws-marketplace:StartChangeSet',
        'aws-marketplace:CancelChangeSet',
        'aws-marketplace:ListEntities',
        'aws-marketplace:DescribeEntity',
        'aws-marketplace:ListTasks',
        'aws-marketplace:DescribeTask',
        'aws-marketplace:UpdateTask',
        'aws-marketplace:CompleteTask'
      ],
      resources: ['*']
    }));

    crossAccountRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [assetBucket.bucketArn, `${assetBucket.bucketArn}/*`],
      conditions: {
        'ForAnyValue:StringEquals': {
          'aws:CalledVia': 'dataexchange.amazonaws.com'
        }
      }
    }));

    crossAccountRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket',
        's3:PutObject',
        's3:PutObjectAcl'
      ],
      resources: ['arn:aws:s3:::*aws-data-exchange*'],
      conditions: {
        'ForAnyValue:StringEquals': {
          'aws:CalledVia': 'dataexchange.amazonaws.com'
        }
      }
    }));
  }

  setupAssetBucket(assetBucketName: cdk.CfnParameter, createAssetBucket: cdk.CfnParameter): s3.IBucket {
    const shouldCreateAssetBucket = new cdk.CfnCondition(this, 'ShouldCreateAssetBucket', {
      expression: cdk.Fn.conditionEquals(createAssetBucket, 'true')
    });

    const assetBucket = new s3.Bucket(this, 'AssetBucket', {
      bucketName: assetBucketName.valueAsString,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED
    });

    const cfnAssetBucket = assetBucket.node.defaultChild as s3.CfnBucket;
    cfnAssetBucket.cfnOptions.condition = shouldCreateAssetBucket;

    return s3.Bucket.fromBucketName(this, 'ProvisionedAssetBucket', assetBucketName.valueAsString);
  }
}