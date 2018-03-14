{define}

<h3>How to ?</h3>
<h4>核心能力</h4>

<p>Her 通过实现以下核心能力来解决前端性能优化：</p>

<ul>
<li><p><strong>强大的自动化构建能力</strong>。Her 集成了 FIS <code>资源定位、内容嵌入、依赖声明</code> 3种编译构建能力，满足了前端构建需求。</p></li>
<li>
<p><strong>核心运行时能力</strong></p>

<ul>
<li>通过 <code>Pagelet</code> Smarty 插件对页面分块。分块收集 HTML 片段及其依赖的 CSS、JS 资源，对页面模块进行细粒度编码，分解资源依赖和数据获取等</li>
<li>后端输出控制器。后端输出控制提供了<code>FirstController</code>、<code>QuicklingController</code>、<code>NoScriptController</code> 3种输出控制器，分别处理基础页请求、局部 Quickling 请求和 NoScript 请求，其中 <code>FirstController</code> 为 <code>Pagelet</code> 提供了 <code>server|lazy|default|none</code> 4种输出模式，方便实现核心(首屏)模块优先输出、非核心模块延迟输出，模块开关等</li>
<li>前端渲染控制器。实现了 <code>Pagelet</code> 按需加载、渲染，资源及其依赖加载、资源动态化打包(计划中)等</li>
</ul>
</li>
<li>
<p><strong>定制优化方案的能力</strong>，通过对 <code>Pagelet</code> 输出和渲染方式的简单配置编码，可以方便实现以下优化方案和业务方案</p>

<ul>
<li>延迟加载 lazyPagelets。对于非核心模块 <code>Pagelets</code> 后端可以使用 <code>lazy</code> 渲染模式，基础页请求的时候只输出占位标签，基础页渲染完成之后通过 <code>Quickling</code> 方式延迟加载 lazyPagelets，从而实现延迟加载 lazyPagelets，减少基础页 DOM 节点数，极大的优化页面渲染性能。</li>
<li>延迟渲染 bigRender。对于不可见模块可以先不渲染，当用户滚动页面的时候再渲染相应模块。可以进一步提升性能，减少不可见模块的图片和数据接口请求等。</li>
<li>局部刷新 Quickling。对于数据交互频繁的模块，可以通过 <code>BigPipe.fetch()</code> 实现局部刷新，可以实现同构的异步渲染逻辑，极大了降低了异步刷新的开发成本。</li>
</ul>
</li>
</ul>

{/define}