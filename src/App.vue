<template>
  <div class="w-full h-screen">
    <h1 class="text-white text-center mt-8">Medicinal plant detection</h1>
    <div class="mx-auto w-full flex justify-content-center">
      <div class="w-30rem mt-5 border-round-lg">
        <FileUpload class="" name="demo[]" :customUpload="true" @uploader="onUploadFile">
          <template #empty>
            <div class="flex align-items-center justify-content-center flex-column">
              <div v-if="isLoading">
                <ProgressSpinner class="ml-6"/>
                <div class="text-center text-4xl">{{ time }}</div>
              </div>
              <p v-else class="mt-4 mb-0">Drag and drop files to here to upload.</p>
            </div>
          </template>
        </FileUpload>
      </div>
    </div>
    <h3 class="text-white text-center mt-8">Detection result</h3>
    <div>
      <div 
        class="my-8 mx-auto px-4 w-7 bg-result border-round-xl"
        v-for="(item, i) in detectionLists"
        :key="i" 
      >
        <div class="flex justify-content-center">
          <div class="mr-2">
            <Image  :src="item.original_image_path" alt="Image" width="350" class="mt-5" preview />
            <div class="text-cyan-50 text-xl mt-3 text-center">Original Image</div>
          </div>
          <div>
            <Image :src="item.predicted_image_path" alt="Image" width="350" class="mt-5" preview />
            <div class="text-cyan-50 text-xl mt-3 text-center">Predicted Image</div>
          </div>
        </div>
        <div class="p-4">
          <!-- <div class="text-cyan-50 text-xl">{{ item.kelas }}</div>
          <div class="text-cyan-50 text-md mt-2">
            {{ item.description }}
          </div> -->

          <Card class="w-18rem mx-auto">
            <!-- <template #title>
                <div class="text-lg">Detection timer</div>
            </template> -->
            <template #content>
              <div class="text-center text-4xl">{{ time }}</div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import FileUpload from 'primevue/fileupload';
import Image from 'primevue/image'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'

const baseUrl = ref("http://localhost:8000")
const isLoading = ref(false)
const time = ref("00:00:00.000")
const timeBegan = ref(null)
const timeStopped = ref(null)
const stoppedDuration = ref(0)
const started = ref(null)
const running = ref(false)
const detectionLists = ref([])

const startTimer = () => {
  if(running.value) return;
  
  if (timeBegan.value === null) {
    reset();
    timeBegan.value = new Date();
  }

  if (timeStopped.value !== null) {
    stoppedDuration.value += (new Date() - timeStopped.value);
  }

  started.value = setInterval(clockRunning, 10);	
  running.value = true;
}

function reset() {
  running.value = false;
  clearInterval(started.value);
  stoppedDuration.value = 0;
  timeBegan.value = null;
  timeStopped.value = null;
  time.value = "00:00:00.000";
}

const stopTimer = () => {
  running.value = false;
  timeStopped.value = new Date();
  clearInterval(started.value);
}

const clockRunning = () => {
  let currentTime = new Date()
  let timeElapsed = new Date(currentTime - timeBegan.value - stoppedDuration.value)
  let hour = timeElapsed.getUTCHours()
  let min = timeElapsed.getUTCMinutes()
  let sec = timeElapsed.getUTCSeconds()
  let ms = timeElapsed.getUTCMilliseconds();

  time.value = 
    zeroPrefix(hour, 2) + ":" + 
    zeroPrefix(min, 2) + ":" + 
    zeroPrefix(sec, 2) + "." + 
    zeroPrefix(ms, 3);
}

function zeroPrefix(num, digit) {
  var zero = '';
  for(var i = 0; i < digit; i++) {
    zero += '0';
  }
  return (zero + num).slice(-digit);
}

const onUploadFile = async (files) => {

  detectionLists.value = []
  reset()
  startTimer()
  isLoading.value = true

  const formData = new FormData()
  formData.append("file", files.files[0])

  console.log("run")

  axios.post(`${ baseUrl.value }/predict`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  })
  .then(resp => {
    console.log(resp.data)
    console.log(resp.data.predicted_image_path)
    console.log(resp.data.original_image_path)
    stopTimer()
    isLoading.value = false
    detectionLists.value.push({
      predicted_image_path: `${ baseUrl.value + resp.data.predicted_image_path }`,
      original_image_path: `${ baseUrl.value + '/' + resp.data.original_image_path }`,
    })
  })
  .catch(err => {
    console.log(err)
    stopTimer()
    isLoading.value = false
  })
}


</script>

<style scoped>
.bg-result{
  background-color: #082e52;
}
</style>