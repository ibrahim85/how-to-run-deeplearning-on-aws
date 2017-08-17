Web Front-end on S3 for MXNet on Lambda
===


1. cd lab4

2. Create a CloudFormation Stack from the template (cfn_template.json : You can find the template on lab4 folder)
	
	![](/Users/jungheek/workspace/deeplearning/lab4/diagram_cfn.png)

	
3. Note all the stack output.

	**Example**

	| Key              | Value                                                                                                  | Description                        |
	|------------------|--------------------------------------------------------------------------------------------------------|------------------------------------|
	| WebsiteURL       | http://mxnet-hosting-tokfx9gcrb3y.s3-website.ap-northeast-2.amazonaws.com,URL for website hosted on S3 |                                    |
	| IdentityPoolId   | ap-northeast-2:2463aef6-5c7a-41bb-832a-e5b814402981                                                    | IdentityPool ID                    |
	| UploadBucketName | mxnet-s3upload-1u37l1aoo7ubf                                                                           | Name of S3 bucket to upload images |
	

4. Modify js/config.js using stack output

	```
	...
      region: 'ap-northeast-2',	
      		//region you selected
      upload_bucket_name: 'mxnet-s3upload-1u37l1aoo7ubf',
      		// Cfn OutPut : UploadBucketName	
      identity_pool_id: 'ap-northeast-2:2463aef6-5c7a-41bb-832a-e5b814402981',
      		// Cfn(current stack) OutPut : UploadBucketName
      predict_url: "https://jz9oyh7050.execute-api.ap-northeast-2.amazonaws.com/prod/mxnet-lambda-v2"
      		//mxnet-lambda URL
	...
	``` 
	
5. Deploy static files to s3
  	
	```	
	aws s3 cp client/ s3://mxnet-hosting-tokfx9gcrb3y --recursive --acl public-read
	```

6. All Done!  