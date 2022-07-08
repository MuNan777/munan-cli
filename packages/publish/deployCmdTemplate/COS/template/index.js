const fs = require('fs')
const path = require('path')
const COS = require('cos-nodejs-sdk-v5')
const inquirer = require('inquirer')

// 本地发布使用配置，下方有云发布使用配置，如使用云发布，请注释此配置，在服务端的 deployConfig 导入配置，同时名称应为 [项目名].js
const { SECRET_ID, SECRET_KEY, BUCKET_NAME, LOCATION, DIST_NAME } = require('./config/index')

async function prompt({ choices, defaultValue, message, type = 'list', require = true }) {
  const options = {
    type,
    name: 'name',
    message,
    default: defaultValue,
    require,
  }
  if (type === 'list')
    options.choices = choices

  return inquirer.prompt(options).then(answer => answer.name)
}

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deploy(config) {
  // 云发布使用配置，使用云发布，请注释此配置，在服务端的 deployConfig 导入配置，同时名称应为 [项目名].js
  // const { SECRET_ID, SECRET_KEY, BUCKET_NAME, LOCATION, DIST_NAME } = config

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
      const isClean = await prompt({
        type: 'confirm',
        message: '存在旧文件，清理旧文件',
      })
      if (isClean) {
        // eslint-disable-next-line no-console
        console.log('清理旧文件')
        await cleanBucket(cos, BUCKET_NAME, LOCATION, objects)
      }
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

