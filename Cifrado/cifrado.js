const http=require('http');
const url=require('url');
const fs=require('fs');
const querystring = require('querystring');

const mime = {
   'html' : 'text/html',
   'css'  : 'text/css',
   'jpg'  : 'image/jpg',
   'ico'  : 'image/x-icon',
   'mp3'  : 'audio/mpeg3',
   'mp4'  : 'video/mp4'
};

const servidor=http.createServer((pedido ,respuesta) => {
    const objetourl = url.parse(pedido.url);
  let camino='public'+objetourl.pathname;
  if (camino=='public/')
    camino='public/index.html';
  encaminar(pedido,respuesta,camino);
});

servidor.listen(8888);


function encaminar (pedido,respuesta,camino) {
  console.log(camino);
  switch (camino) {
    case 'public/recuperardatos': {
      recuperar(pedido,respuesta);
      break;
    }	
    default : {  
      fs.stat(camino, error => {
        if (!error) {
        fs.readFile(camino,(error, contenido) => {
          if (error) {
            respuesta.writeHead(500, {'Content-Type': 'text/plain'});
            respuesta.write('Error interno');
            respuesta.end();					
          } else {
            const vec = camino.split('.');
            const extension=vec[vec.length-1];
            const mimearchivo=mime[extension];
            respuesta.writeHead(200, {'Content-Type': mimearchivo});
            respuesta.write(contenido);
            respuesta.end();
          }
        });
      } else {
        respuesta.writeHead(404, {'Content-Type': 'text/html'});
        respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');		
        respuesta.end();
        }
      });	
    }
  }	
}


function recuperar(pedido,respuesta) {
  let info = '';
  pedido.on('data', datosparciales => {
    info += datosparciales;
  });
  pedido.on('end', () => {
    const formulario = querystring.parse(info);
    respuesta.writeHead(200, {'Content-Type': 'text/html'});
    
    var contra = formulario['contraseña'];
    var ces = formulario['cesar'];
    var elec = formulario['eleccion'];
    //const res = Descifrar(contra, ces);
    const res = CifrarDescifrar(elec, contra, ces);
   /* const pagina=
      `<!doctype html><html><head></head><body>
       Nombre de usuario:${formulario['cesar']}<br>
      Clave:${formulario['contraseña']}<br>
      <a href="index.html">Retornar</a>
      </body></html>`*/
    respuesta.end(res);
  });	
}

console.log('Servidor web iniciado');

function CifrarDescifrar(eleccion, contraseña, cesar) {

  if(eleccion == 0)
  {
    return Cifrar(contraseña, cesar);
  }
  else if(eleccion == 1)
  {
    return Descifrar(contraseña, cesar);
  }

}


function Cifrar(contraseña, cesar) {
    var abc = 'abcdefghijklmnopqrstuvwxyz';
    var indice;
    var sobrepasa;
    var cifrando = '';
    for(var i = 0; i < contraseña.length; i++) {
        indice = abc.indexOf(contraseña[i]) + parseInt(cesar);

        if(indice > 25) {
            sobrepasa = indice - 25;
            cifrando+=abc[sobrepasa-1];
        }
        else {
            cifrando+=abc[indice];
        }

    }
    return cifrando.toString();
}

function Descifrar(contraseña, cesar) {
    var abc = 'abcdefghijklmnopqrstuvwxyz';
    var indice;
    var sobrepasa;
    var descifrando = '';

    for(var i = 0; i < contraseña.length; i++) {
        indice = abc.indexOf(contraseña[i]) - parseInt(cesar);

        if(indice < 0) {
            sobrepasa = indice + 25;
            descifrando += abc[sobrepasa+1];
        }
        else {
            descifrando += abc[indice];
        }

    }
    return descifrando.toString();
}