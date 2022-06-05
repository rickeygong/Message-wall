// 把查询字符串中的值赋值给搜索框
document.querySelector('.search').value = new URL(window.location.href).searchParams.get('search');

function search() {
  const search = document.querySelector('.search').value;
  if (search.length <= 0) {
    alert('请输入搜索关键字');
    return;
  }
  // 浏览器的 url
  const url = new URL(window.location.href);
  url.searchParams.set('search', search);

  // 刷新页面，URL 改变
  window.location.href = url.href;
}

function clean() {
  const search = document.querySelector('.search').value;
  if (search.length <= 0) {
    alert('搜索框没有内容，不需要清除！');
    return;
  }
  // 浏览器的 url
  const url = new URL(window.location.href);
  url.searchParams.delete('search');
  // 刷新页面，URL 改变
  window.location.href = url.href;
}

function showPublish() {
  // 显示输入框
  document.querySelector('.input-dialog').hidden = false;

  // 滚动到顶部
  // this changes the scrolling behavior to "smooth"
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancel() {
  // 隐藏输入框
  document.querySelector('.input-dialog').hidden = true;
}

async function confirm() {
  // 发布内容

  // 获取输入框的内容
  const content = document.querySelector('.input-content').value;

  // 发布帖子
  await createPost(content);

  // 刷新页面数据
  await refresh();

  // 凿空输入框
  document.querySelector('.input-content').value = '';

  // 隐藏输入框
  document.querySelector('.input-dialog').hidden = true;
}
// GET 获取帖子列表
function getPosts() {
  // 把浏览器 url 的查询字符串的 search 值
  // 给到接口请求的 url 当中

  // 接口的 url
  const url = new URL('https://3yya.com/u/459b08af9653804b/rest/app/posts');

  const search = new URL(window.location.href).searchParams.get('search');
  if (search) {
    url.searchParams.set('search', search);
  }

  return fetch(url);
}

// POST 发布帖子
function createPost(content) {
  console.log(typeof content);
  if (content.length <= 0) {
    alert('请输入内容!');

    return;
  }
  let data = {
    content: content,
  };
  return fetch('https://3yya.com/u/459b08af9653804b/rest/app/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

// PUT更新帖子
function updatePost(postid, content) {
  debugger;
  // if (content.length <= 0) {
  //   alert('更新的消息不能为空!');
  //   return;
  // }
  let data = {
    content: content,
  };

  return fetch(`https://3yya.com/u/459b08af9653804b/rest/app/posts/${postid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

// DELETE 删除帖子
function deletePost(id) {
  return fetch(`https://3yya.com/u/459b08af9653804b/rest/app/posts/${id}`, {
    method: 'DELETE',
  });
}

async function refresh() {
  // 更新页面内容

  // 先清空数据
  document.querySelector('.container .posts').innerHTML = '';

  const response = await getPosts();
  const result = await response.json();

  // 没有消息
  if (result.results.length == 0) {
    document.querySelector('.empty').hidden = false;
  }

  for (const post of result.results) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const content = document.createElement('p');
    content.classList.add('content');
    content.textContent = post.content;

    postElement.append(content);

    const bottom = document.createElement('div');
    bottom.classList.add('bottom');
    postElement.append(bottom);

    const time = document.createElement('p');
    time.classList.add('time');
    time.textContent = formatTime(post.publish_time);

    bottom.append(time);

    const buttons = document.createElement('div');
    buttons.classList.add('buttons');
    bottom.append(buttons);

    const edit = document.createElement('div');
    edit.classList.add('button');
    edit.classList.add('edit');

    edit.onclick = function () {
      // 1. 创建输入框
      const input = document.createElement('textarea');
      input.classList.add('input-content');
      input.value = content.textContent;

      // 2. 把文本元素替换成输入框
      content.replaceWith(input);

      // 3. 创建确认按钮
      const confirm = document.createElement('div');
      confirm.classList.add('button');
      confirm.classList.add('edit');
      confirm.textContent = '确认';

      confirm.onclick = async function () {
        // 1. 更新消息
        if (input.value.length <= 0) {
          alert('编辑的内容不能为空!');
          refresh();
          return;
        }
        await updatePost(post.post_id, input.value);

        // 2. 输入框替换回原来的文本元素
        content.textContent = input.value;
        input.replaceWith(content);

        // 3. 确认替换回编辑
        confirm.replaceWith(edit);
      };

      // 4. 编辑按钮替换成确认按钮
      edit.replaceWith(confirm);
    };

    edit.textContent = '编辑';
    buttons.append(edit);

    const deleteElement = document.createElement('div');
    deleteElement.classList.add('button');
    deleteElement.classList.add('delete');
    deleteElement.textContent = '删除';

    deleteElement.onclick = async function () {
      // 1. 调用删除接口
      await deletePost(post.post_id);

      // 2. 删掉消息元素自身
      postElement.remove();
    };

    buttons.append(deleteElement);

    document.querySelector('.container .posts').append(postElement);
  }
}

function formatTime(timestamp) {
  const time = new Date(timestamp * 1000);
  return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
}

refresh();
