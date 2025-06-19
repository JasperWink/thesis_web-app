## Diminished reality thesis


## Deployment
# Back-end
1. Deploy the back-end files on a device that has access to an NVIDIA GPU. If you don't have access to one, remove the line: "model.to("cuda")". Now the YOLO model will run on the CPU (Which is slower). 

2. Create and run a virtual enviorenement using:
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

# Proxy server *optional
The proxy folder is not required. But in our case it is required to access the back-end.

If it is needed, the files should be deployed on a device that has access to the back-end and steps 2-4 from the back-end section should be followed as well. Aditionally the ip address and port number of the back-end should be defined in the backend socket.


# Front-end
The front-end should be on a device that has access to a SLL certificate. The path to, and names of the certificates should be defined in server.js.

If the back-end is accessable directly, the "target_ip" and "port" in server.js should point to the back-end directly. Else, the port number and ip should point to the proxy.

In order to download all packages run the following command in the folder with "package.json".
```
npm install
```
