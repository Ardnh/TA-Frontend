<template>
  <Toast/>
  <div class="w-full h-screen">
    <h1 class="text-white text-center pt-8">Medicinal plant detection</h1>
    <div class="mx-auto w-full flex justify-content-center">
      <div class="w-30rem mt-5 border-round-lg">
        <FileUpload class="shadow-5" accept="image/*" name="demo[]" :customUpload="true" @uploader="onUploadFile">
          <template #empty>
            <div class="flex align-items-center justify-content-center flex-column">
              <div v-if="isLoading">
                <ProgressSpinner class="ml-6"/>
                <div class="text-center text-4xl">{{ time }}</div>
                <div class="text-center mt-2">detection process is running...</div>
              </div>
              <p v-else class="mt-4 mb-0">Drag and drop files to here to upload.</p>
            </div>
          </template>
        </FileUpload>
      </div>
    </div>
    <h3 v-if="detectionLists.length > 0" class="text-white text-2xl text-center mt-8">Detection result</h3>
    <div>
      <div 
        class="mb-5 mt-4 mx-auto px-4 border-round-xl"
        v-for="(item, i) in detectionLists"
        :key="i" 
      >
        <div class="flex justify-content-center">
          <Image :src="item.predicted_image_path" alt="Image" width="350" class="mt-5" preview />
        </div>
      </div>
    </div>
    <div v-if="detectionLists.length > 0">
      <div class="mx-auto mt-4 w-10 p-3" v-for="item in selectedData" :key="item.title">
        <div class="text-2xl text-white font-bold">{{ item.name }}</div>
        <div class="bg-indigo-900 p-4 border-round-md mt-2 w-full">
          <div class="text-xl text-white font-bold">Deskripsi</div>
          <div class="bg-indigo-700 p-3 text-white my-1 border-round-md">{{ item.history }}</div>
        </div>
        <div class="bg-indigo-900 p-4 border-round-md mt-2 w-full">
          <div class="text-xl text-white font-bold">Manfaat {{ item.name }}</div>
          <div class="flex flex-wrap justify-content-center">
            <div v-for="(item, i) in item.benefit" :key="i" class="bg-indigo-700 p-3 mx-1 my-1 border-round-md w-20rem">
                <div class="text-lg text-white font-semibold">{{item.name}}</div>
                <div class="mt-2 text-md text-white">{{ item.desc }}</div>
            </div>
          </div>
        </div>
        <div class="mt-3 bg-indigo-900 p-4 border-round-md ">
          <div class="text-xl text-white font-bold">Sumber</div>
          <div v-for="item,i in item.reference" :key="i">
            <div class="cursor-pointer text-md text-white font-normal mt-2">- {{ item.ref }}</div>
          </div>
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
import Toast from 'primevue/toast';
// import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner'
import { data, items } from './utils/data.js'
import { useToast } from "primevue/usetoast";

const toast = useToast();
const baseUrl = ref("http://localhost:8000")
const medData = ref(data)
// const medItems = ref(items)
const selectedItems = ref(null)
const selectedData = ref([])
const isLoading = ref(false)
const time = ref("00:00:00.000")
const timeBegan = ref(null)
const timeStopped = ref(null)
const stoppedDuration = ref(0)
const started = ref(null)
const running = ref(false)
const detectionLists = ref([])


const getData = (id) => {
  selectedData.value = []
  const select = medData.value.find(item => item.id === id)
  selectedData.value.push(select)
}

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

  selectedItems.value = null
  selectedData.value = []
  detectionLists.value = []
  reset()
  startTimer()
  isLoading.value = true

  const formData = new FormData()
  formData.append("file", files.files[0])

  try {
    axios.post(`${ baseUrl.value }/predict`, formData, {
      timeout: 180000,
      headers: {
        "Content-Type": "multipart/form-data",
      }
    })
    .then(resp => {
      stopTimer()
      let class_id = resp.data.class_name.id
      isLoading.value = false
      detectionLists.value.push({
        predicted_image_path: `${ baseUrl.value + resp.data.predicted_image_path }`,
        original_image_path: `${ baseUrl.value + '/' + resp.data.original_image_path }`,
      })
      getData(class_id)
    })
    .catch(err => {
      console.log(err)
      if (err.message) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Waktu deteksi telah habis!', life: 3000 });
        stopTimer()
        isLoading.value = false
      }
    })
    
  } catch (err) {
    stopTimer()
    isLoading.value = false
  }

}


</script>

<style scoped>
.bg-result{
  background-color: #082e52;
}
</style>