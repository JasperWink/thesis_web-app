# Diminished reality thesis
Name: Jasper Wink
UvA ID: 14616513

This repository contains the source code for the diminished reality web application for the phone.


# Deployment
The following steps help you deploy the web application.

## Back-end
1. Deploy the back-end files on a device that has access to an NVIDIA GPU. If you don't have access to one, remove the line: "model.to("cuda")" from the file "back-end.py". Now the YOLO model will run on the CPU (Which is slower). 

2. Create and run a virtual environment using:
```
Linux / MacOS:
python3 -m venv venv
source venv/bin/activate

Windows:
python -m venv venv
venv\Scripts\activate
```

3. Download the required packages using:
```
pip install -r requirements.txt
```

4. The python file can now be ran with the command:
```
python3 back-end.py
```

## Proxy server *optional
The proxy folder is not required. But in our case it is required to access the back-end.

1. If it is needed, the files should be deployed on a device that has access to the back-end and follow steps 2-3 from the back-end section.

2. The ip address and port number of the back-end should be defined in the backend socket.

3. Finally run the proxy file using the following command:
```
python3 proxy.py
```

## Front-end
1. The front-end should be on a device that has access to a SLL certificate. The path to, and names of the certificates should be defined in server.js.

2. If the back-end is accessable directly, the "target_ip" and "port" in server.js should point to the back-end directly. Else, the port number and ip should point to the proxy.

3. Now create and run a virtual environment, see steps 2 and 3 in the back-end section.

4. Download all packages by running the following command in the folder with "package.json".
```
npm install
```

5. Finally run start the web application using the command:
```
./run.sh
```
