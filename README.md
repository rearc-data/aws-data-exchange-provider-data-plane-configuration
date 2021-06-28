<a href="https://www.rearc.io/data/">
    <img src="./rearc_logo_rgb.png" alt="Rearc Logo" title="Rearc Logo" height="52" />
</a>

# Rearc Data Platform - Data Plane Configuration
This repository includes all the resources and code required to get onboarded on the Rearc Data Platform.

## What is this?
Rearc provides a data platform for data providers which simplifies providing data products via AWS Data Exchange (ADX).

The platform publishes data and handles rate-limiting to avoid exceeding ADX's service limits, logging of publish operations, and insights for data providers.

This repository includes everything you need to get started with Rearc's Data Platform.

## Installation
**Before running the following steps, please reach out to us at [data@rearc.io](mailto:data@rearc.io) so that we can help add you to the platform.**

To install, simply deploy the [CloudFormation Stack](cloudformation/) or [CDK Stack](cdk/) inside the AWS account where your data products reside (or will reside).

This will create a cross-account role that allows Rearc to perform a very limited set of ADX-related actions on your behalf, as well as an S3 bucket where data assets for publish are kept.

There are a few parameters that must be set:
| Parameter Name  | Valid values  | Description   |
| --------------- | ------------- | ------------- |
| **AssetBucketName** | S3 bucket name (e.g., `my-example-bucket`)  | The name of the S3 bucket where your data assets reside (or will reside). This bucket must reside in the AWS account where the Cloudformation template is running. |
| **CreateAssetBucket** | `true` or `false`  | If this is `true`, the template will create the bucket given in `AssetBucketName`. Set this to `false` if you wish to use a pre-existing assets bucket. |
| **ControlPlaneAccount** | AWS account ID | The account ID of the Rearc control plane. Please reach out to data@rearc.io for this value. |
| **ExternalId** | AWS External ID  | The External ID for the cross-account role. Please reach out to data@rearc.io for this value. |

### CloudFormation Setup
<a href="https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/quickcreate?templateURL=https://s3.amazonaws.com/rearc-control-plane-cloudformation/adx-data-plane.cfn.yaml&stackName=ADXDataPlaneStack">
    <img src="https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png" alt="Launch Stack" title="Launch Stack" height="30" />
</a>

### CDK Setup
From the [cdk](cdk/) directory, run the following commands:
```
npm install
npm run cdk deploy -- --parameters AssetBucketName=<bucket> --parameters CreateAssetBucket=<true|false> --parameters ControlPlaneAccount=<account> --parameters ExternalId=<id>
```

If the aws account you're deploy to was never boostrapped before, run the following command before deploying:
```
npm run cdk bootstrap aws://<account-id>/<region>
```

## Usage
To use the data platform:
1. Create a dataset with at least one finalized revision (we recommend creating an initial revision with just a product description).
2. Attach the dataset to an ADX product.
3. Place the data assets to be published into the assets S3 bucket (defined in your CloudFormation template).
4. Create a manifest file indicating which assets to publish to your data product (see the [manifest file format](#-manifest-file-format) section for more information).
5. Place the manifest file in the Manifests S3 bucket (this bucket is provided by Rearc)

Once the manifest file lands in the Manifests S3 bucket, Rearc's Data Platform will orchestrate an ADX publish operation inside your account.

## Q&A
**Q: Why should we use this instead of using the AWS Data Exchange API (for example, via Boto3)?**

*A: The ADX API has a number of [service limits](https://docs.aws.amazon.com/data-exchange/latest/userguide/limits.html) which can result in unexpected failures when exceeded. Rearc has created a platform that publishes data assets without exceeding these limits. In the near future, we also plan to add features such as insights around data pipeline stability and product popularity.*

**Q: Why do you need to create a cross-account role?**

*A: To publish data products on your behalf, we need access to AWS Data Exchange and AWS Marketplace from your account. To publish data assets, Data Exchange requires `ListBucket` and `GetObject` access to the S3 bucket where those assets reside, as well as to an Amazon-managed ADX bucket. We have set up the access policy for the cross-account role to give the minimum set of permissions necessary for us to publish on your behalf, and our access policy **does not** give us access to your data assets in S3 (access to S3 is conditioned to the data exchange service only).*

**Q: I still don't want to create a cross-account role. Is there an alternative for me?**

*A: Yes! Our open-source [Publisher-Coordinator](https://github.com/rearc-data/aws-data-exchange-publisher-coordinator) project provides a subset of the functionality provided by the Rearc Data Platform in a solution that is hosted entirely within your AWS account. The trade-off is that the Publisher-Coordinator must be administered and updated by you, and the scope of the project is smaller.*

### Manifest File Format
The manifest file should follow a specific format:
- The name of the manifest file should end with `.json`
- The file should include a `JSON` object with the following format:
```
{
  "product_id": <PRODUCT_ID>,
  "dataset_id": <DATASET_ID>,
  "asset_list": [
    { "Bucket": <S3_BUCKET_NAME>, "Key": <S3_OBJECT_KEY> },
    { "Bucket": <S3_BUCKET_NAME>, "Key": <S3_OBJECT_KEY> },
    ...
  ]
}
```

### Contact Details
- If you find any issues with or have enhancement ideas for this project, open up a GitHub [issue](https://github.com/rearc-data/aws-data-exchange-provider-data-plane-configuration/issues) and we will gladly take a look at it. Better yet, submit a pull request. Any contributions you make are greatly appreciated :heart:
- If you have any questions or feedback, send us an email at data@rearc.io.

### About Rearc
Rearc is a cloud, software and services company. We believe that empowering engineers drives innovation. Cloud-native architectures, modern software and data practices, and the ability to safely experiment can enable engineers to realize their full potential. We have partnered with several enterprises and startups to help them achieve agility. Our approach is simple — empower engineers with the best tools possible to make an impact within their industry.
