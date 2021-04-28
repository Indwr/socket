let username 
let socket = io()
do {
    username = prompt('Enter your name: ')
} while(!username)

let randomNumber = Math.random(10000,99999);
setCookie("username", randomNumber, 30);

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function checkCookie() {
    var user=getCookie("username");
    if (user != "") {
     return user;
    } else {
       user = prompt("Please enter your name:","");
       if (user != "" && user != null) {
         setCookie("username", user, 30);
       }
    }
  }

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
const textarea = document.querySelector('#textarea')
const user_ids = document.querySelector('#user_id')
const submitBtn = document.querySelector('#submitBtn')
const commentBox = document.querySelector('.comment__box')

submitBtn.addEventListener('click', (e) => {
    e.preventDefault()
    let comment = textarea.value
    let user_id = checkCookie();
    if(!comment) {
        return
    }
    postComment(comment,user_id)
})

function postComment(comment,user_id) {
    // Append to dom
    let data = {
        user_id: user_id,
        username: username,
        comment: comment
    }
    appendToDom(data)
    textarea.value = ''
    user_ids.value = ''
    // Broadcast
    broadcastComment(data)
    // Sync with Mongo Db
    syncWithDb(data)

}

function appendToDom(data) {
    console.log(data);
    let lTag = document.createElement('li')
    lTag.classList.add('comment', 'mb-3')

    let markup = `
                        <div class="card border-light mb-3">
                            <div class="card-body">
                                <h6>${data.username}</h6>
                                <h6>${data.user_id}</h6>

                                <p>${data.comment}</p>
                                <div>
                                    <img src="/img/clock.png" alt="clock">
                                    <small>${moment(data.time).format('LT')}</small>
                                </div>
                            </div>
                        </div>
    `
    lTag.innerHTML = markup

    commentBox.prepend(lTag)
}

function broadcastComment(data) {
    // Socket
    socket.emit('comment', data)
}

socket.on('comment', (data) => {
    appendToDom(data)
})
let timerId = null
function debounce(func, timer) {
    if(timerId) {
        clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
        func()
    }, timer)
}
let typingDiv = document.querySelector('.typing')
socket.on('typing', (data) => {
    typingDiv.innerText = `${data.username} is typing...`
    debounce(function() {
        typingDiv.innerText = ''
    }, 1000)
})

// Event listner on textarea
textarea.addEventListener('keyup', (e) => {
    socket.emit('typing', { username })
})

// Api calls 

function syncWithDb(data) {
    const headers = {
        'Content-Type': 'application/json'
    }
    fetch('/api/comments', { method: 'Post', body:  JSON.stringify(data), headers})
        .then(response => response.json())
        .then(result => {
            // console.log(result)
        })
}

function fetchComments () {
    fetch('/api/comments')
        .then(res => res.json())
        .then(result => {
            result.forEach((comment) => {
                comment.time = comment.createdAt
                appendToDom(comment)
            })
        })
}

window.onload = fetchComments