#!/usr/bin/env bash

# Exit on error. Append "|| true" if you expect an error.
set -o errexit
# Exit on error inside any functions or subshells.
set -o errtrace

STACK_NAME='adx-provider-data-plane-masi' #  name of the cloudformation stack
ONBOARDING_TOPIC_ARN="<ONBOARDING_SQS_TOPIC_ARN>"  # this will be provide to you in our customer onboarding email
CONTROL_PLANE_AWS_ACCOUNT_NUMBER="<REARC_AWS_ACCOUNT_ID>"  # this will be provided to you in our customer onboarding email
EXTERNAL_ID="Rearcdata-<CUSTOMER_AWS_ACCOUNT_ID>"  # replace <CUSTOMER_AWS_ACCOUNT_ID> with customer AWS account ID or otherwise specify a desired external ID
ASSET_BUCKET_NAME="<ASSET_BUCKET_NAME>"  # this can be  bucket name for an existing asset bucket or a desired name for a new bucket to be created by the stack
CREATE_ASSET_BUCKET="false"  # set this to "true" if you wish to create a new asset bucket for your ADX data using this stack
REGION="us-east-1"  # replace this with the name of AWS region you are running this cloudformation stack in
PROFILE="default"  # replace this with your desired AWS credentials profile name 


aws cloudformation deploy --stack-name "$STACK_NAME" \
  --template-file ./source/adx_data_plane.cfn.yaml \
  --parameter-overrides ControlPlaneAccount="$CONTROL_PLANE_AWS_ACCOUNT_NUMBER" \
              ExternalId="$EXTERNAL_ID" \
              AssetBucketName="$ASSET_BUCKET_NAME" \
              CreateAssetBucket="$CREATE_ASSET_BUCKET" \
              RegistrationTopicARN="$ONBOARDING_TOPIC_ARN" \
              EnvName="prod" \
  --capabilities "CAPABILITY_AUTO_EXPAND" "CAPABILITY_NAMED_IAM" "CAPABILITY_IAM" \
  --region "$REGION" \
  --profile $PROFILE    