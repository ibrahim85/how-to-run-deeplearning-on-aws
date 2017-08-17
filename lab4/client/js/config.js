angular.module('config', [])
  .constant('config',
  {
    prod: {
      region: 'ap-northeast-2',
      upload_bucket_name: 'mxnet-s3upload-1u37l1aoo7ubf',
      identity_pool_id: 'ap-northeast-2:2463aef6-5c7a-41bb-832a-e5b814402981',
      predict_url: "https://jz9oyh7050.execute-api.ap-northeast-2.amazonaws.com/prod/mxnet-lambda-v2"
    }
  }
  )
  ;
