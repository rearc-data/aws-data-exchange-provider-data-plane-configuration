#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ADXDataPlaneStack } from '../lib/adx-data-plane-stack';

const app = new cdk.App();
new ADXDataPlaneStack(app, 'ADXDataPlaneStack', {
  description: 'Create S3 bucket and cross-account role for ADX data plane with minimal permissions.'
});