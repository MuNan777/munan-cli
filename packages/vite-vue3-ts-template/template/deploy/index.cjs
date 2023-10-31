const fs = require('fs');
const path = require('path');
const loading = require('loading-cli');

const COS = require('cos-nodejs-sdk-v5');
const { SECRET_ID, SECRET_KEY, BUCKET_NAME, LOCATION } = require('./config/index.cjs')

const DIST_PATH = path.resolve(__dirname, '..', 'dist')

const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY
});

function getCosData() {
  return new Promise((resolve, reject) => {
    cos.getService((err, data) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(data)
    })
  })
}

async function checkBucket(bucketName) {
  const { Buckets } = await getCosData()
  return Buckets.find(item => item.Name === bucketName) != null
}

function createBucket(Bucket, Region) {
  return new Promise((resolve, reject) => {
    cos.putBucket({
      Bucket,
      Region,
    }, function (err, data) {
      if (err) {
        console.err(err)
        reject(err)
      }
      resolve(data)
    });
  })
}

function putObject(Bucket, Region, Key, Body) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket,
      Region,
      Key,
      Body,
    }, function (err, data) {
      if (err) {
        console.err(err)
        reject(err)
      }
      resolve(data)
    });
  })
}

function getAllFiles(Path) {
  const files = fs.readdirSync(Path)
  for (let file of files) {
    const filePath = path.resolve(Path, file)
    if (fs.statSync(filePath).isDirectory()) {
      const temp = getAllFiles(filePath)
      files.push(...temp.map(item => `${file}/${item}`))
    }
  }
  return files
}

function deleteMultipleObject(Bucket, Region, Objects) {
  if (Objects.length > 0) {
    return new Promise((resolve, reject) => {
      cos.deleteMultipleObject({
        Bucket,
        Region,
        Objects,
      }, (delError, deleteResult) => {
        if (delError) {
          console.log('delete error', delError);
          console.log('delete stop');
          reject(delError)
        } else {
          resolve(deleteResult)
        }
      });
    })
  } else {
    return Promise.resolve(null)
  }
}

async function getBucketFiles(Bucket, Region, Prefix) {
  return new Promise((resolve, reject) => {
    cos.getBucket({
      Bucket, /* 填入您自己的存储桶，必须字段 */
      Region,  /* 存储桶所在地域，例如ap-beijing，必须字段 */
      Prefix,
    }, (listError, listResult) => {
      if (listError) {
        console.log('list error:', listError)
        reject(listError)
      }
      let objects = listResult.Contents.map(function (item) {
        return { Key: item.Key }
      });
      resolve(objects)
    });
  })
}

function cleanBucket(Bucket, Region) {
  return new Promise(async (resolve, reject) => {
    try {
      let objects = await getBucketFiles(Bucket, Region, '')
      objects = objects.filter(obj => {
        return !/models\/.*/.test(obj.Key)
      })
      await deleteMultipleObject(Bucket, Region, objects)
      resolve(objects)
    } catch (e) {
      reject(e)
    }
  })
}

async function deploy() {
  console.log('开始发布')
  console.time('发布耗时')
  const load = loading("开始发布").start()
  if (!(await checkBucket(BUCKET_NAME))) {
    await createBucket(BUCKET_NAME, LOCATION)
  }
  try {
    load.text = '清理旧文件'
    await cleanBucket(BUCKET_NAME, LOCATION)
    load.text = '上传文件'
    const files = getAllFiles(DIST_PATH)
    for (let file of files) {
      const filePath = path.resolve(DIST_PATH, file)
      const stat = fs.statSync(filePath)
      if (stat.isFile()) {
        const stream = fs.createReadStream(filePath)
        await putObject(BUCKET_NAME, LOCATION, file, stream)
      }
    }
    load.stop()
    console.log('发布完成')
    console.timeEnd('发布耗时')
  } catch (e) {
    console.error(e)
    console.log('发布失败')
  }
}

deploy()