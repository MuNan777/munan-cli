const fs = require('fs')
const path = require('path')
const COS = require('cos-nodejs-sdk-v5')

function getCosData(cos) {
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

async function checkBucket(cos, bucketName) {
  const { Buckets } = await getCosData(cos)
  return Buckets.find(item => item.Name === bucketName) != null
}

function createBucket(cos, Bucket, Region) {
  return new Promise((resolve, reject) => {
    cos.putBucket({
      Bucket,
      Region,
    }, (err, data) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(data)
    })
  })
}

function putObject(cos, Bucket, Region, Key, Body) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket,
      Region,
      Key,
      Body,
    }, (err, data) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(data)
    })
  })
}

function getAllFiles(Path) {
  const files = fs.readdirSync(Path)
  for (const file of files) {
    const filePath = path.resolve(Path, file)
    if (fs.statSync(filePath).isDirectory()) {
      const temp = getAllFiles(filePath)
      files.push(...temp.map(item => `${file}/${item}`))
    }
  }
  return files
}

function deleteMultipleObject(cos, Bucket, Region, Objects) {
  return new Promise((resolve, reject) => {
    cos.deleteMultipleObject({
      Bucket,
      Region,
      Objects,
    }, (delError, deleteResult) => {
      if (delError) {
        // eslint-disable-next-line no-console
        console.log('delete error', delError)
        // eslint-disable-next-line no-console
        console.log('delete stop')
        reject(delError)
      }
      else {
        resolve(deleteResult)
      }
    })
  })
}

async function getBucketFiles(cos, Bucket, Region, Prefix) {
  return new Promise((resolve, reject) => {
    cos.getBucket({
      Bucket, /* 填入您自己的存储桶，必须字段 */
      Region, /* 存储桶所在地域，例如ap-beijing，必须字段 */
      Prefix,
    }, (listError, listResult) => {
      if (listError) {
        // eslint-disable-next-line no-console
        console.log('list error:', listError)
        reject(listError)
      }
      const objects = listResult.Contents.map((item) => {
        return { Key: item.Key }
      })
      resolve(objects)
    })
  })
}

async function cleanBucket(cos, Bucket, Region, objects) {
  await deleteMultipleObject(cos, Bucket, Region, objects)
  return objects
}

async function deploy() {
  // 本地发布配置路径
  let configPath = ''
  // 云发布使用配置，使用云发布，
  // 需要在服务端的 根目录下 deployConfig 文件夹，如没有则创建，然后导入配置，同时名称应为 [项目名].js
  // 注意!!!, 发布脚本内不能存在交互代码，目前没有实现云端交互功能
  const argv = process.argv
  if (argv.length > 2 && argv[2])
    configPath = argv[2].split('--config-path=')[1]
  else
    throw new Error('Invalid config path')

  const { SECRET_ID, SECRET_KEY, BUCKET_NAME, LOCATION, DIST_NAME } = require(configPath)

  const DIST_PATH = path.resolve(__dirname, '..', DIST_NAME)

  const cos = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRET_KEY,
  })

  // eslint-disable-next-line no-console
  console.log('开始发布')
  if (!(await checkBucket(cos, BUCKET_NAME)))
    await createBucket(cos, BUCKET_NAME, LOCATION)

  try {
    const objects = await getBucketFiles(cos, BUCKET_NAME, LOCATION, '')
    if (objects.length > 0) {
      // eslint-disable-next-line no-console
      console.log('清理旧文件')
      await cleanBucket(cos, BUCKET_NAME, LOCATION, objects)
    }
    // eslint-disable-next-line no-console
    console.log('上传文件')
    const files = getAllFiles(DIST_PATH)
    for (const file of files) {
      const filePath = path.resolve(DIST_PATH, file)
      const stat = fs.statSync(filePath)
      if (stat.isFile()) {
        const stream = fs.createReadStream(filePath)
        await putObject(cos, BUCKET_NAME, LOCATION, file, stream)
      }
    }
    // eslint-disable-next-line no-console
    console.log('发布成功')
  }
  catch (e) {
    console.error(e)
    // eslint-disable-next-line no-console
    console.log('发布失败')
  }
}

deploy()

