- First remove your pem field from the mup.json. So, your mup.json only has the username and host only.
- Then start a ssh agent with eval $(ssh-agent)
- Then add your ssh key with ssh-add <path-to-key>
- Then you'll asked to enter the passphrase to the key
- After that simply invoke mup commands and they'll just work
- Once you've deployed your app kill the ssh agent with ssh-agent -k


- https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04
- http://www.itzgeek.com/how-tos/linux/ubuntu-how-tos/how-to-install-graylog-on-ubuntu-16-04.html
- password_secret: kkBSmiygmCOP4n8hORTHJBIwFiYHorBks1Qz3jIddCaSLnTq4s3wBOJMW2oDzWkm1cGTay7JwyHVMaeTaxGPo4fJlUtucwAL
- root_password_sha2: 4583da7c96f6a69d69be519d1e4c48bc30af714c55e00f9ec750c34f8d23252a
