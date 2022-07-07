const fs = require('fs')
const path = require('path')
const COS = require('cos-nodejs-sdk-v5')
const inquirer = require('inquirer')

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

// 可通过更换配置路径，实现云端发布需求
const { SECRET_ID, SECRET_KEY, BUCKET_NAME, LOCATION, DIST_NAME } = require('./config/index')

const DIST_PATH = path.resolve(__dirname, '..', DIST_NAME)

const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
})

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
    }, (err, data) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(data)
    })
  })
}

function putObject(Bucket, Region, Key, Body) {
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

function deleteMultipleObject(Bucket, Region, Objects) {
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

async function getBucketFiles(Bucket, Region, Prefix) {
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

async function cleanBucket(Bucket, Region, objects) {
  await deleteMultipleObject(Bucket, Region, objects)
  return objects
}

async function deploy() {
  // eslint-disable-next-line no-console
  console.log('开始发布')
  if (!(await checkBucket(BUCKET_NAME)))
    await createBucket(BUCKET_NAME, LOCATION)

  try {
    const objects = await getBucketFiles(BUCKET_NAME, LOCATION, '')
    if (objects.length > 0) {
      const isClean = await prompt({
        type: 'confirm',
        message: '存在旧文件，清理旧文件',
      })
      if (isClean) {
        // eslint-disable-next-line no-console
        console.log('清理旧文件')
        await cleanBucket(BUCKET_NAME, LOCATION, objects)
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
        await putObject(BUCKET_NAME, LOCATION, file, stream)
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

