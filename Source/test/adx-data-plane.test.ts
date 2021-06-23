import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ADXDataPlane from '../lib/adx-data-plane-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ADXDataPlane.ADXDataPlaneStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Parameters": {
        "AssetBucketName": {
          "Type": "String",
          "Default": "rearc-data-provider",
          "Description": "Bucket containing assets and referenced in the manifest."
        },
        "CreateAssetBucket": {
          "Type": "String",
          "AllowedValues": [
            "true",
            "false"
          ],
          "Description": "Defines if the asset bucket should be provisioned."
        },
        "ControlPlaneAccount": {
          "Type": "String",
          "Description": "ID of the control plane account to connect to."
        },
        "ExternalId": {
          "Type": "String",
          "Description": "External ID for connecting to the control plane - provided during onboarding."
        }
      },
      "Conditions": {
        "ShouldCreateAssetBucket": {
          "Fn::Equals": [
            {
              "Ref": "CreateAssetBucket"
            },
            "true"
          ]
        }
      },
      "Resources": {
        "AssetBucket1D025086": {
          "Type": "AWS::S3::Bucket",
          "Properties": {
            "BucketName": {
              "Ref": "AssetBucketName"
            },
            "OwnershipControls": {
              "Rules": [
                {
                  "ObjectOwnership": "BucketOwnerPreferred"
                }
              ]
            },
            "PublicAccessBlockConfiguration": {
              "BlockPublicAcls": true,
              "BlockPublicPolicy": true,
              "IgnorePublicAcls": true,
              "RestrictPublicBuckets": true
            }
          },
          "UpdateReplacePolicy": "Retain",
          "DeletionPolicy": "Retain",
          "Condition": "ShouldCreateAssetBucket"
        },
        "CrossAccountRoleFACE29D1": {
          "Type": "AWS::IAM::Role",
          "Properties": {
            "AssumeRolePolicyDocument": {
              "Statement": [
                {
                  "Action": "sts:AssumeRole",
                  "Condition": {
                    "StringEquals": {
                      "sts:ExternalId": {
                        "Ref": "ExternalId"
                      }
                    }
                  },
                  "Effect": "Allow",
                  "Principal": {
                    "AWS": {
                      "Fn::Join": [
                        "",
                        [
                          "arn:",
                          {
                            "Ref": "AWS::Partition"
                          },
                          ":iam::",
                          {
                            "Ref": "ControlPlaneAccount"
                          },
                          ":root"
                        ]
                      ]
                    }
                  }
                }
              ],
              "Version": "2012-10-17"
            },
            "Path": "/"
          }
        },
        "CrossAccountRoleDefaultPolicy212A317F": {
          "Type": "AWS::IAM::Policy",
          "Properties": {
            "PolicyDocument": {
              "Statement": [
                {
                  "Action": [
                    "dataexchange:GetDataSet",
                    "dataexchange:ListDataSets",
                    "dataexchange:UpdateRevision",
                    "dataexchange:ListJobs",
                    "dataexchange:GetJob",
                    "dataexchange:CreateAsset",
                    "dataexchange:GetRevision",
                    "dataexchange:CreateJob",
                    "dataexchange:CreateRevision",
                    "dataexchange:UpdateDataSet",
                    "dataexchange:UpdateAsset",
                    "dataexchange:StartJob",
                    "dataexchange:ListDataSetRevisions"
                  ],
                  "Effect": "Allow",
                  "Resource": "*"
                },
                {
                  "Action": [
                    "aws-marketplace:ListChangeSets",
                    "aws-marketplace:DescribeChangeSet",
                    "aws-marketplace:StartChangeSet",
                    "aws-marketplace:CancelChangeSet",
                    "aws-marketplace:ListEntities",
                    "aws-marketplace:DescribeEntity",
                    "aws-marketplace:ListTasks",
                    "aws-marketplace:DescribeTask",
                    "aws-marketplace:UpdateTask",
                    "aws-marketplace:CompleteTask"
                  ],
                  "Effect": "Allow",
                  "Resource": "*"
                },
                {
                  "Action": [
                    "s3:GetObject",
                    "s3:ListBucket"
                  ],
                  "Condition": {
                    "ForAnyValue:StringEquals": {
                      "aws:CalledVia": "dataexchange.amazonaws.com"
                    }
                  },
                  "Effect": "Allow",
                  "Resource": [
                    {
                      "Fn::Join": [
                        "",
                        [
                          "arn:",
                          {
                            "Ref": "AWS::Partition"
                          },
                          ":s3:::",
                          {
                            "Ref": "AssetBucketName"
                          }
                        ]
                      ]
                    },
                    {
                      "Fn::Join": [
                        "",
                        [
                          "arn:",
                          {
                            "Ref": "AWS::Partition"
                          },
                          ":s3:::",
                          {
                            "Ref": "AssetBucketName"
                          },
                          "/*"
                        ]
                      ]
                    }
                  ]
                },
                {
                  "Action": [
                    "s3:GetObject",
                    "s3:ListBucket",
                    "s3:PutObject",
                    "s3:PutObjectAcl"
                  ],
                  "Condition": {
                    "ForAnyValue:StringEquals": {
                      "aws:CalledVia": "dataexchange.amazonaws.com"
                    }
                  },
                  "Effect": "Allow",
                  "Resource": "arn:aws:s3:::*aws-data-exchange*"
                }
              ],
              "Version": "2012-10-17"
            },
            "PolicyName": "CrossAccountRoleDefaultPolicy212A317F",
            "Roles": [
              {
                "Ref": "CrossAccountRoleFACE29D1"
              }
            ]
          }
        }
      }
    }, MatchStyle.EXACT))
});
